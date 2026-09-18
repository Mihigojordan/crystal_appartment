import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface ExtractedPaymentInfo {
  amount: number | null;
  date: string | null;
  phone: string | null;
  provider: string | null;
  reference: string | null;
}

const logger = new Logger('PaymentExtractionService');

const SYSTEM_PROMPT =
  'You read mobile money (MTN MoMo, Airtel Money) payment confirmation screenshots and extract the transaction details. ' +
  'Respond with ONLY a JSON object, no prose: ' +
  '{"amount": number|null, "date": "YYYY-MM-DD"|null, "phone": string|null, "provider": "MoMo"|"Airtel"|null, "reference": string|null}. ' +
  'amount must be the plain numeric transaction amount with no currency symbol, letters, or thousands separators. ' +
  'If the screenshot is not a payment confirmation, or a field cannot be read, use null for that field.';

@Injectable()
export class PaymentExtractionService {
  constructor(private readonly config: ConfigService) {}

  async extractFromScreenshot(imageUrl: string): Promise<ExtractedPaymentInfo> {
    const apiKey = this.config.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      throw new ServiceUnavailableException(
        'Payment screenshot verification is not configured — check backend/.env',
      );
    }

    let res: Response;
    try {
      res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          response_format: { type: 'json_object' },
          max_tokens: 300,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            {
              role: 'user',
              content: [
                { type: 'text', text: 'Extract the payment details from this screenshot.' },
                { type: 'image_url', image_url: { url: imageUrl } },
              ],
            },
          ],
        }),
      });
    } catch (err) {
      logger.error(`OpenAI request failed: ${(err as Error).message}`);
      throw new BadRequestException(
        'Could not reach the screenshot verification service — try again shortly',
      );
    }

    if (!res.ok) {
      logger.error(`OpenAI extraction failed: ${res.status} ${await res.text()}`);
      throw new BadRequestException('Could not read the screenshot — try a clearer image');
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new BadRequestException('Could not read the screenshot — try a clearer image');
    }

    try {
      const parsed = JSON.parse(content) as Partial<ExtractedPaymentInfo>;
      return {
        amount: typeof parsed.amount === 'number' ? parsed.amount : null,
        date: typeof parsed.date === 'string' ? parsed.date : null,
        phone: typeof parsed.phone === 'string' ? parsed.phone : null,
        provider: typeof parsed.provider === 'string' ? parsed.provider : null,
        reference: typeof parsed.reference === 'string' ? parsed.reference : null,
      };
    } catch {
      throw new BadRequestException('Could not read the screenshot — try a clearer image');
    }
  }
}
