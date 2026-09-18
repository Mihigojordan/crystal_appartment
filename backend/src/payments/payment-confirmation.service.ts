import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Payment } from './payments.service';
import { Booking } from '../bookings/bookings.service';

const logger = new Logger('PaymentConfirmationService');
const RWF_METHODS = ['MoMo', 'Airtel'];
const BREVO_ENDPOINT = 'https://api.brevo.com/v3/smtp/email';

export interface ApprovalDetails {
  contractSignDate?: string | null;
  approvalMessage?: string | null;
  whatsappNumber?: string | null;
  contractRequirements?: string | null;
}

const escapeHtml = (value: string) =>
  value.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string);

@Injectable()
export class PaymentConfirmationService {
  constructor(private readonly config: ConfigService) {}

  async sendConfirmationEmail(
    payment: Payment,
    booking: Booking | null,
    details: ApprovalDetails,
  ): Promise<{ sent: boolean; reason?: string }> {
    const to = booking?.guestEmail;
    if (!to) return { sent: false, reason: 'No guest email on file for this booking' };

    const apiKey = this.config.get<string>('BREVO_API_KEY');
    const fromEmail = this.config.get<string>('EMAIL_FROM');
    if (!apiKey || !fromEmail) {
      logger.warn(
        'Email is not configured — set BREVO_API_KEY and EMAIL_FROM (and optionally EMAIL_FROM_NAME) in backend/.env to send payment confirmations.',
      );
      return { sent: false, reason: 'Email is not configured' };
    }

    const fromName = this.config.get<string>('EMAIL_FROM_NAME') ?? 'Crystal Guest House';
    const guestName = booking?.guestName ?? payment.tenantName ?? 'there';
    const apartmentTitle = booking?.apartmentTitle ?? payment.apartmentName ?? '—';
    const amountLabel = RWF_METHODS.includes(payment.method)
      ? `RWF ${payment.amount.toLocaleString()}`
      : `$${payment.amount.toLocaleString()}`;
    const waDigits = details.whatsappNumber?.replace(/[^\d+]/g, '');

    const { html, text } = this.buildEmail({
      guestName,
      apartmentTitle,
      amountLabel,
      method: payment.method,
      date: payment.date,
      approvalMessage: details.approvalMessage,
      contractSignDate: details.contractSignDate,
      contractRequirements: details.contractRequirements,
      whatsappNumber: details.whatsappNumber,
      waDigits,
    });

    try {
      const res = await fetch(BREVO_ENDPOINT, {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          'api-key': apiKey,
        },
        body: JSON.stringify({
          sender: { name: fromName, email: fromEmail },
          to: [{ email: to, name: guestName }],
          subject: 'Payment Received — Your Receipt',
          textContent: text,
          htmlContent: html,
        }),
      });

      if (!res.ok) {
        logger.error(`Brevo send failed: ${res.status} ${await res.text()}`);
        return { sent: false, reason: 'Failed to send email' };
      }
      return { sent: true };
    } catch (err) {
      logger.error(`Failed to send confirmation email: ${(err as Error).message}`);
      return { sent: false, reason: 'Failed to send email' };
    }
  }

  private buildEmail(data: {
    guestName: string;
    apartmentTitle: string;
    amountLabel: string;
    method: string;
    date: string;
    approvalMessage?: string | null;
    contractSignDate?: string | null;
    contractRequirements?: string | null;
    whatsappNumber?: string | null;
    waDigits?: string;
  }): { html: string; text: string } {
    const message = data.approvalMessage?.trim() || 'Thank you for your payment — we\'re excited to welcome you!';

    const textLines = [
      `Hi ${data.guestName},`,
      '',
      message,
      '',
      'Payment Receipt',
      `Apartment: ${data.apartmentTitle}`,
      `Amount Paid: ${data.amountLabel}`,
      `Payment Method: ${data.method}`,
      `Date Paid: ${data.date}`,
      'Status: Approved — Payment Received',
      '',
    ];
    if (data.contractRequirements) {
      textLines.push('To sign your rental contract, please bring:', data.contractRequirements, '');
    }
    if (data.contractSignDate) {
      textLines.push(`Please visit our office on or before ${data.contractSignDate} to sign your contract.`, '');
    }
    if (data.whatsappNumber) {
      textLines.push(`Questions? Chat with us on WhatsApp: ${data.whatsappNumber}`, '');
    }
    textLines.push('Thank you for choosing us!');

    const html = `
      <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:560px;margin:0 auto;color:#22252b;">
        <h2 style="margin:0 0 16px;">Crystal Guest House</h2>
        <p>Hi ${escapeHtml(data.guestName)},</p>
        <p>${escapeHtml(message).replace(/\n/g, '<br/>')}</p>

        <div style="background:#f9fafb;border-radius:10px;padding:18px 20px;margin:22px 0;">
          <h3 style="margin:0 0 12px;font-size:15px;">Payment Receipt</h3>
          <table style="width:100%;font-size:14px;border-collapse:collapse;">
            <tr><td style="padding:4px 0;color:#6b7280;">Apartment</td><td style="padding:4px 0;text-align:right;">${escapeHtml(data.apartmentTitle)}</td></tr>
            <tr><td style="padding:4px 0;color:#6b7280;">Amount Paid</td><td style="padding:4px 0;text-align:right;font-weight:700;">${escapeHtml(data.amountLabel)}</td></tr>
            <tr><td style="padding:4px 0;color:#6b7280;">Payment Method</td><td style="padding:4px 0;text-align:right;">${escapeHtml(data.method)}</td></tr>
            <tr><td style="padding:4px 0;color:#6b7280;">Date Paid</td><td style="padding:4px 0;text-align:right;">${escapeHtml(data.date)}</td></tr>
            <tr><td style="padding:4px 0;color:#6b7280;">Status</td><td style="padding:4px 0;text-align:right;color:#16a34a;font-weight:700;">Approved — Received</td></tr>
          </table>
        </div>

        ${
          data.contractRequirements
            ? `<p><strong>To sign your rental contract, please bring:</strong><br/>${escapeHtml(data.contractRequirements).replace(/\n/g, '<br/>')}</p>`
            : ''
        }

        ${
          data.contractSignDate
            ? `<p style="color:#c2410c;font-weight:700;">Please visit our office on or before ${escapeHtml(data.contractSignDate)} to sign your contract.</p>`
            : ''
        }

        ${
          data.whatsappNumber
            ? `<p>Have questions? Chat with us on WhatsApp: <a href="https://wa.me/${data.waDigits}" style="color:#25D366;font-weight:700;">${escapeHtml(data.whatsappNumber)}</a></p>`
            : ''
        }

        <p style="margin-top:24px;">Thank you for choosing us!</p>
      </div>
    `;

    return { html, text: textLines.join('\n') };
  }
}
