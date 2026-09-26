import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';

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
  'Respond with ONLY a JSON object, no prose, no markdown code fences: ' +
  '{"amount": number|null, "date": "YYYY-MM-DD"|null, "phone": string|null, "provider": "MoMo"|"Airtel"|null, "reference": string|null}. ' +
  'amount must be the plain numeric transaction amount with no currency symbol, letters, or thousands separators. ' +
  'If the screenshot is not a payment confirmation, or a field cannot be read, use null for that field.';

@Injectable()
export class PaymentExtractionService {
  constructor(private readonly config: ConfigService) {}

  async extractFromScreenshot(imageUrl: string): Promise<ExtractedPaymentInfo> {
    const apiKey = this.config.get<string>('ANTHROPIC_API_KEY');
    if (!apiKey) {
      throw new ServiceUnavailableException(
        'Payment screenshot verification is not configured — check backend/.env',
      );
    }

    const client = new Anthropic({ apiKey });

    let response: Anthropic.Message;
    try {
      response = await client.messages.create({
        model: 'claude-opus-5',
        max_tokens: 512,
        output_config: { effort: 'low' },
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image', source: { type: 'url', url: imageUrl } },
              { type: 'text', text: 'Extract the payment details from this screenshot.' },
            ],
          },
        ],
      });
    } catch (err) {
      if (err instanceof Anthropic.AuthenticationError) {
        logger.error(`Anthropic authentication failed: ${err.message}`);
      } else if (err instanceof Anthropic.RateLimitError) {
        logger.error(`Anthropic rate limited: ${err.message}`);
      } else if (err instanceof Anthropic.APIError) {
        logger.error(`Anthropic request failed: ${err.status} ${err.message}`);
      } else {
        logger.error(`Anthropic request failed: ${(err as Error).message}`);
      }
      throw new BadRequestException(
        'Could not reach the screenshot verification service — try again shortly',
      );
    }

    let text: string | undefined;
    for (const block of response.content) {
      if (block.type === 'text') {
        text = block.text;
        break;
      }
    }
    if (!text) {
      throw new BadRequestException('Could not read the screenshot — try a clearer image');
    }

    try {
      const jsonText = text.trim().replace(/^```(?:json)?/, '').replace(/```$/, '').trim();
      const parsed = JSON.parse(jsonText) as Partial<ExtractedPaymentInfo>;
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
