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

type SendResult = { sent: boolean; reason?: string };

const escapeHtml = (value: string) =>
  value.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string);

const methodLabel = (method: string) =>
  method === 'MoMo' ? 'MTN MoMo' : method === 'Airtel' ? 'Airtel Money' : method;

const bookingRef = (payment: Payment) =>
  `BK-${(payment.bookingId ?? payment.id).slice(-6).toUpperCase()}`;

@Injectable()
export class PaymentConfirmationService {
  constructor(private readonly config: ConfigService) {}

  private async send(
    to: string,
    toName: string,
    subject: string,
    html: string,
    text: string,
  ): Promise<SendResult> {
    const apiKey = this.config.get<string>('BREVO_API_KEY');
    const fromEmail = this.config.get<string>('EMAIL_FROM');
    if (!apiKey || !fromEmail) {
      logger.warn(
        'Email is not configured — set BREVO_API_KEY and EMAIL_FROM (and optionally EMAIL_FROM_NAME) in backend/.env to send emails.',
      );
      return { sent: false, reason: 'Email is not configured' };
    }
    const fromName = this.config.get<string>('EMAIL_FROM_NAME') ?? 'Crystal Guest House';

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
          to: [{ email: to, name: toName }],
          subject,
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
      logger.error(`Failed to send email: ${(err as Error).message}`);
      return { sent: false, reason: 'Failed to send email' };
    }
  }

  // Sent to the guest once an admin approves a payment — doubles as their
  // payment receipt and contract-signing instructions.
  async sendApprovedEmail(
    payment: Payment,
    booking: Booking | null,
    details: ApprovalDetails,
    guestEmail?: string,
    monthlyRent?: number | null,
  ): Promise<SendResult> {
    const to = guestEmail || booking?.guestEmail;
    if (!to) return { sent: false, reason: 'No guest email on file for this payment' };

    const guestName = booking?.guestName ?? payment.tenantName ?? 'there';
    const apartmentTitle = booking?.apartmentTitle ?? payment.apartmentName ?? '—';
    const amountLabel = RWF_METHODS.includes(payment.method)
      ? `RWF ${payment.amount.toLocaleString()}`
      : `$${payment.amount.toLocaleString()}`;
    const rentLabel = monthlyRent ? `RWF ${monthlyRent.toLocaleString()}` : '—';
    const methodAndPhone = `${methodLabel(payment.method)}${payment.guestPhone ? ` · ${payment.guestPhone}` : ''}`;
    const waDigits = details.whatsappNumber?.replace(/[^\d+]/g, '');

    const { html, text } = this.buildApprovedEmail({
      ref: bookingRef(payment),
      guestName,
      apartmentTitle,
      rentLabel,
      moveIn: booking?.moveIn || '—',
      methodAndPhone,
      date: payment.date,
      amountLabel,
      approvalMessage: details.approvalMessage,
      contractSignDate: details.contractSignDate,
      contractRequirements: details.contractRequirements,
      whatsappNumber: details.whatsappNumber,
      waDigits,
    });

    return this.send(to, guestName, 'Booking approved: your receipt for ' + apartmentTitle, html, text);
  }

  // Sent to the guest when an admin rejects a payment/booking.
  async sendRejectedEmail(
    payment: Payment,
    booking: Booking | null,
    reason: string,
    guestEmail?: string,
  ): Promise<SendResult> {
    const to = guestEmail || booking?.guestEmail;
    if (!to) return { sent: false, reason: 'No guest email on file for this payment' };

    const guestName = booking?.guestName ?? payment.tenantName ?? 'there';
    const apartmentTitle = booking?.apartmentTitle ?? payment.apartmentName ?? '—';
    const browseUrl = `${this.config.get<string>('CORS_ORIGIN') ?? 'http://localhost:5173'}/apartments`;

    const { html, text } = this.buildRejectedEmail({
      ref: bookingRef(payment),
      guestName,
      apartmentTitle,
      reason,
      browseUrl,
    });

    return this.send(to, guestName, `Your booking for ${apartmentTitle} was not approved`, html, text);
  }

  // Sent to the business inbox when a guest submits a MoMo payment receipt
  // for manual review (PaymentsService.createManual).
  async sendNewBookingAdminEmail(
    payment: Payment,
    booking: Booking | null,
  ): Promise<SendResult> {
    const to = this.config.get<string>('ADMIN_NOTIFICATION_EMAIL') || this.config.get<string>('EMAIL_FROM');
    if (!to) return { sent: false, reason: 'No admin notification email configured' };

    const apartmentTitle = booking?.apartmentTitle ?? payment.apartmentName ?? '—';
    const amountLabel = RWF_METHODS.includes(payment.method)
      ? `RWF ${payment.amount.toLocaleString()}`
      : `$${payment.amount.toLocaleString()}`;

    const { html, text } = this.buildNewBookingAdminEmail({
      ref: bookingRef(payment),
      apartmentTitle,
      guestName: booking?.guestName ?? payment.tenantName ?? '—',
      guestPhone: booking?.guestPhone ?? payment.guestPhone ?? '—',
      guestEmail: booking?.guestEmail ?? '—',
      moveIn: booking?.moveIn || '—',
      notes: booking?.notes || '—',
      method: methodLabel(payment.method),
      paidFromPhone: payment.guestPhone ?? '—',
      date: payment.date,
      amountLabel,
    });

    return this.send(to, 'Admin', `New booking: ${apartmentTitle}`, html, text);
  }

  private buildApprovedEmail(data: {
    ref: string;
    guestName: string;
    apartmentTitle: string;
    rentLabel: string;
    moveIn: string;
    methodAndPhone: string;
    date: string;
    amountLabel: string;
    approvalMessage?: string | null;
    contractSignDate?: string | null;
    contractRequirements?: string | null;
    whatsappNumber?: string | null;
    waDigits?: string;
  }): { html: string; text: string } {
    const message = data.approvalMessage?.trim() || "Thank you for your payment! We're excited to welcome you.";
    const showContract = Boolean(data.contractSignDate || data.contractRequirements);

    const textLines = [
      `Hi ${data.guestName},`,
      '',
      message,
      '',
      'Payment receipt',
      `Apartment: ${data.apartmentTitle}`,
      `Monthly rent: ${data.rentLabel}`,
      `Move-in date: ${data.moveIn}`,
      `Payment method: ${data.methodAndPhone}`,
      `Date of payment: ${data.date}`,
      `Deposit paid: ${data.amountLabel}`,
      '',
    ];
    if (showContract) {
      textLines.push('Signing the contract');
      if (data.contractSignDate) textLines.push(`Sign before: ${data.contractSignDate}`);
      if (data.contractRequirements) textLines.push(`What to bring: ${data.contractRequirements}`);
      textLines.push('');
    }
    if (data.whatsappNumber) {
      textLines.push(`Questions about the contract? Chat with us on WhatsApp at ${data.whatsappNumber}.`, '');
    }
    textLines.push('Keep this email as your payment receipt.');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>Booking approved: your receipt for ${escapeHtml(data.apartmentTitle)}</title>
<style>
@media (max-width:620px){.w100{width:100%!important}.px{padding-left:20px!important;padding-right:20px!important}}
</style>
</head>
<body style="margin:0;padding:0;background-color:#f4efeb;">
<span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;mso-hide:all;">Your booking for ${escapeHtml(data.apartmentTitle)} is approved. Payment receipt and contract signing details inside.</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f4efeb" style="background-color:#f4efeb;">
<tr><td align="center" style="padding:32px 12px;">
<!--[if mso]><table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
<table role="presentation" class="w100" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background-color:#ffffff;border-radius:16px;">

<tr><td bgcolor="#ff5a3c" class="px" style="background-color:#ff5a3c;background-image:linear-gradient(90deg,#ff7a3d,#ff4d4f);border-radius:16px 16px 0 0;padding:28px 40px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:16px;mso-line-height-rule:exactly;letter-spacing:1px;text-transform:uppercase;color:#ffffff;font-weight:bold;">Booking ${escapeHtml(data.ref)} · Approved</td></tr>
<tr><td style="padding-top:8px;font-family:Arial,Helvetica,sans-serif;font-size:26px;line-height:32px;mso-line-height-rule:exactly;color:#ffffff;font-weight:bold;">Your booking is confirmed</td></tr>
</table>
</td></tr>

<tr><td class="px" style="padding:28px 40px 0 40px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:23px;mso-line-height-rule:exactly;color:#3a3f47;">Hi ${escapeHtml(data.guestName)},</td></tr>
<tr><td class="px" style="padding:8px 40px 0 40px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:25px;mso-line-height-rule:exactly;color:#1f2329;">${escapeHtml(message).replace(/\n/g, '<br/>')}</td></tr>

<tr><td class="px" style="padding:28px 40px 10px 40px;font-family:Arial,Helvetica,sans-serif;font-size:18px;line-height:24px;font-weight:bold;color:#1f2329;">Payment receipt</td></tr>
<tr><td class="px" style="padding:0 40px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #efe4dc;border-radius:12px;">
<tr><td width="42%" style="padding:12px 16px;border-bottom:1px solid #efe4dc;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#6b7079;">Apartment</td><td style="padding:12px 16px;border-bottom:1px solid #efe4dc;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;color:#1f2329;">${escapeHtml(data.apartmentTitle)}</td></tr>
<tr><td style="padding:12px 16px;border-bottom:1px solid #efe4dc;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#6b7079;">Monthly rent</td><td style="padding:12px 16px;border-bottom:1px solid #efe4dc;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;color:#1f2329;">${escapeHtml(data.rentLabel)}</td></tr>
<tr><td style="padding:12px 16px;border-bottom:1px solid #efe4dc;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#6b7079;">Move-in date</td><td style="padding:12px 16px;border-bottom:1px solid #efe4dc;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;color:#1f2329;">${escapeHtml(data.moveIn)}</td></tr>
<tr><td style="padding:12px 16px;border-bottom:1px solid #efe4dc;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#6b7079;">Payment method</td><td style="padding:12px 16px;border-bottom:1px solid #efe4dc;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;color:#1f2329;">${escapeHtml(data.methodAndPhone)}</td></tr>
<tr><td style="padding:12px 16px;border-bottom:1px solid #efe4dc;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#6b7079;">Date of payment</td><td style="padding:12px 16px;border-bottom:1px solid #efe4dc;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;color:#1f2329;">${escapeHtml(data.date)}</td></tr>
<tr><td bgcolor="#fcf6f2" style="padding:14px 16px;background-color:#fcf6f2;border-radius:0 0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#6b7079;">Deposit paid</td><td bgcolor="#fcf6f2" style="padding:14px 16px;background-color:#fcf6f2;border-radius:0 0 12px 0;font-family:Arial,Helvetica,sans-serif;font-size:20px;font-weight:bold;color:#e8492c;">${escapeHtml(data.amountLabel)}</td></tr>
</table>
</td></tr>

${
  showContract
    ? `<tr><td class="px" style="padding:28px 40px 10px 40px;font-family:Arial,Helvetica,sans-serif;font-size:18px;line-height:24px;font-weight:bold;color:#1f2329;">Signing the contract</td></tr>
<tr><td class="px" style="padding:0 40px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#fcf6f2" style="background-color:#fcf6f2;border-radius:12px;">
${
  data.contractSignDate
    ? `<tr><td style="padding:18px 22px 4px 22px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:16px;letter-spacing:1px;text-transform:uppercase;font-weight:bold;color:#6b7079;">Sign before</td></tr>
<tr><td style="padding:0 22px 16px 22px;font-family:Arial,Helvetica,sans-serif;font-size:20px;line-height:26px;font-weight:bold;color:#e8492c;">${escapeHtml(data.contractSignDate)}</td></tr>
<tr><td style="padding:0 22px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td height="1" style="height:1px;line-height:1px;font-size:0;background-color:#efe4dc;">&nbsp;</td></tr></table></td></tr>`
    : ''
}
${
  data.contractRequirements
    ? `<tr><td style="padding:16px 22px 4px 22px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:16px;letter-spacing:1px;text-transform:uppercase;font-weight:bold;color:#6b7079;">What to bring</td></tr>
<tr><td style="padding:0 22px 20px 22px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:23px;color:#1f2329;">${escapeHtml(data.contractRequirements).replace(/\n/g, '<br/>')}</td></tr>`
    : ''
}
</table>
</td></tr>`
    : ''
}

${
  data.whatsappNumber
    ? `<tr><td class="px" style="padding:24px 40px 0 40px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:23px;color:#3a3f47;">Questions about the contract? Chat with us on WhatsApp at <strong style="color:#1f2329;">${escapeHtml(data.whatsappNumber)}</strong>.</td></tr>
<tr><td class="px" style="padding:16px 40px 36px 40px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" bgcolor="#ff5a3c" style="background-color:#ff5a3c;background-image:linear-gradient(90deg,#ff7a3d,#ff4d4f);border-radius:28px;">
<a href="https://wa.me/${data.waDigits}" style="display:block;padding:15px 32px;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:bold;color:#ffffff;text-decoration:none;">Chat on WhatsApp</a>
</td></tr></table>
</td></tr>`
    : `<tr><td style="padding:16px;">&nbsp;</td></tr>`
}

<tr><td bgcolor="#fcf6f2" class="px" style="background-color:#fcf6f2;border-radius:0 0 16px 16px;padding:20px 40px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#6b7079;">
Keep this email as your payment receipt.
</td></tr>
</table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr>
</table>
</body>
</html>
`;

    return { html, text: textLines.join('\n') };
  }

  private buildRejectedEmail(data: {
    ref: string;
    guestName: string;
    apartmentTitle: string;
    reason: string;
    browseUrl: string;
  }): { html: string; text: string } {
    const text = [
      `Hi ${data.guestName},`,
      '',
      `Thank you for your interest in ${data.apartmentTitle}. Unfortunately, the owner could not approve your booking.`,
      '',
      'Reason from the owner:',
      data.reason,
      '',
      `Browse other apartments: ${data.browseUrl}`,
      '',
      'Questions? Reply to this email.',
    ].join('\n');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>Your booking for ${escapeHtml(data.apartmentTitle)} was not approved</title>
<style>
@media (max-width:620px){.w100{width:100%!important}.px{padding-left:20px!important;padding-right:20px!important}}
</style>
</head>
<body style="margin:0;padding:0;background-color:#f4efeb;">
<span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;mso-hide:all;">Your booking request for ${escapeHtml(data.apartmentTitle)} was not approved. See the reason from the owner inside.</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f4efeb" style="background-color:#f4efeb;">
<tr><td align="center" style="padding:32px 12px;">
<!--[if mso]><table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
<table role="presentation" class="w100" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background-color:#ffffff;border-radius:16px;">

<tr><td bgcolor="#ff5a3c" height="6" style="height:6px;line-height:6px;font-size:0;background-color:#ff5a3c;background-image:linear-gradient(90deg,#ff7a3d,#ff4d4f);border-radius:16px 16px 0 0;">&nbsp;</td></tr>

<tr><td class="px" style="padding:36px 40px 0 40px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:16px;mso-line-height-rule:exactly;letter-spacing:1px;text-transform:uppercase;font-weight:bold;color:#e8492c;">Booking ${escapeHtml(data.ref)} · ${escapeHtml(data.apartmentTitle)}</td></tr>
<tr><td class="px" style="padding:10px 40px 0 40px;font-family:Arial,Helvetica,sans-serif;font-size:26px;line-height:32px;mso-line-height-rule:exactly;font-weight:bold;color:#1f2329;">Your booking was not approved</td></tr>
<tr><td class="px" style="padding:14px 40px 0 40px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:23px;mso-line-height-rule:exactly;color:#3a3f47;">Hi ${escapeHtml(data.guestName)}, thank you for your interest in ${escapeHtml(data.apartmentTitle)}. Unfortunately, the owner could not approve your booking.</td></tr>

<tr><td class="px" style="padding:24px 40px 0 40px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#fcf6f2" style="background-color:#fcf6f2;border-radius:12px;">
<tr><td style="padding:20px 22px 6px 22px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:16px;letter-spacing:1px;text-transform:uppercase;font-weight:bold;color:#6b7079;">Reason from the owner</td></tr>
<tr><td style="padding:0 22px 22px 22px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:25px;color:#1f2329;">${escapeHtml(data.reason).replace(/\n/g, '<br/>')}</td></tr>
</table>
</td></tr>

<tr><td class="px" style="padding:28px 40px 0 40px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" bgcolor="#ff5a3c" style="background-color:#ff5a3c;background-image:linear-gradient(90deg,#ff7a3d,#ff4d4f);border-radius:28px;">
<a href="${data.browseUrl}" style="display:block;padding:15px 32px;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:bold;color:#ffffff;text-decoration:none;">Browse other apartments</a>
</td></tr></table>
</td></tr>
<tr><td class="px" style="padding:20px 40px 36px 40px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:21px;color:#3a3f47;">Questions? Reply to this email.</td></tr>

<tr><td bgcolor="#fcf6f2" class="px" style="background-color:#fcf6f2;border-radius:0 0 16px 16px;padding:20px 40px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#6b7079;">
You received this because you requested a booking with us.
</td></tr>
</table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr>
</table>
</body>
</html>
`;

    return { html, text };
  }

  private buildNewBookingAdminEmail(data: {
    ref: string;
    apartmentTitle: string;
    guestName: string;
    guestPhone: string;
    guestEmail: string;
    moveIn: string;
    notes: string;
    method: string;
    paidFromPhone: string;
    date: string;
    amountLabel: string;
  }): { html: string; text: string } {
    const text = [
      `A new guest has submitted a booking and a Mobile Money deposit for ${data.apartmentTitle}.`,
      '',
      'Guest information',
      `Full name: ${data.guestName}`,
      `Phone: ${data.guestPhone}`,
      `Email: ${data.guestEmail}`,
      `Desired move-in: ${data.moveIn}`,
      `Notes: ${data.notes}`,
      '',
      'Payment',
      `Method: ${data.method}`,
      `Paid from number: ${data.paidFromPhone}`,
      `Date of payment: ${data.date}`,
      `Amount paid: ${data.amountLabel}`,
      '',
      'Please confirm the payment on your MoMo account, then contact the guest to finalise the booking.',
    ].join('\n');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>New booking: ${escapeHtml(data.apartmentTitle)}</title>
<style>
@media (max-width:620px){.w100{width:100%!important}.px{padding-left:20px!important;padding-right:20px!important}.stack{display:block!important;width:100%!important}.btn-gap{padding:0 0 12px 0!important}}
</style>
</head>
<body style="margin:0;padding:0;background-color:#f4efeb;">
<span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;mso-hide:all;">${escapeHtml(data.guestName)} booked ${escapeHtml(data.apartmentTitle)} and paid ${escapeHtml(data.amountLabel)} via ${escapeHtml(data.method)}. Details inside.</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f4efeb" style="background-color:#f4efeb;">
<tr><td align="center" style="padding:32px 12px;">
<!--[if mso]><table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
<table role="presentation" class="w100" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background-color:#ffffff;border-radius:16px;">

<tr><td bgcolor="#ff5a3c" style="background-color:#ff5a3c;background-image:linear-gradient(90deg,#ff7a3d,#ff4d4f);border-radius:16px 16px 0 0;padding:28px 40px;" class="px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:16px;mso-line-height-rule:exactly;letter-spacing:1px;text-transform:uppercase;color:#ffffff;font-weight:bold;">New booking · Action needed</td></tr>
<tr><td style="padding-top:8px;font-family:Arial,Helvetica,sans-serif;font-size:26px;line-height:32px;mso-line-height-rule:exactly;color:#ffffff;font-weight:bold;">Someone booked your apartment</td></tr>
</table>
</td></tr>

<tr><td class="px" style="padding:28px 40px 8px 40px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:23px;mso-line-height-rule:exactly;color:#3a3f47;">
Hello, a new guest has submitted a booking and a Mobile Money deposit. Booking and payment details are below.
</td></tr>

<tr><td class="px" style="padding:20px 40px 0 40px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#fcf6f2" style="background-color:#fcf6f2;border-radius:12px;">
<tr>
<td width="72" style="width:72px;padding:16px 0 16px 16px;" valign="middle">
<table role="presentation" width="56" cellpadding="0" cellspacing="0" border="0"><tr><td width="56" height="56" bgcolor="#e9ded6" style="width:56px;height:56px;background-color:#e9ded6;border-radius:10px;font-family:Arial,Helvetica,sans-serif;font-size:9px;color:#8a7f77;text-align:center;">PHOTO</td></tr></table>
</td>
<td style="padding:16px;" valign="middle">
<div style="font-family:Arial,Helvetica,sans-serif;font-size:17px;line-height:22px;font-weight:bold;color:#1f2329;text-transform:uppercase;">${escapeHtml(data.apartmentTitle)}</div>
</td>
<td align="right" style="padding:16px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:16px;color:#6b7079;" valign="middle">Booking ref<br><span style="font-size:14px;font-weight:bold;color:#1f2329;">${escapeHtml(data.ref)}</span></td>
</tr>
</table>
</td></tr>

<tr><td class="px" style="padding:28px 40px 10px 40px;font-family:Arial,Helvetica,sans-serif;font-size:18px;line-height:24px;font-weight:bold;color:#1f2329;">Guest information</td></tr>
<tr><td class="px" style="padding:0 40px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #efe4dc;border-radius:12px;">
<tr><td width="40%" style="padding:12px 16px;border-bottom:1px solid #efe4dc;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#6b7079;">Full name</td><td style="padding:12px 16px;border-bottom:1px solid #efe4dc;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;color:#1f2329;">${escapeHtml(data.guestName)}</td></tr>
<tr><td style="padding:12px 16px;border-bottom:1px solid #efe4dc;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#6b7079;">Phone</td><td style="padding:12px 16px;border-bottom:1px solid #efe4dc;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;"><a href="tel:${escapeHtml(data.guestPhone)}" style="color:#1f2329;text-decoration:none;">${escapeHtml(data.guestPhone)}</a></td></tr>
<tr><td style="padding:12px 16px;border-bottom:1px solid #efe4dc;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#6b7079;">Email</td><td style="padding:12px 16px;border-bottom:1px solid #efe4dc;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;"><a href="mailto:${escapeHtml(data.guestEmail)}" style="color:#1f2329;text-decoration:none;">${escapeHtml(data.guestEmail)}</a></td></tr>
<tr><td style="padding:12px 16px;border-bottom:1px solid #efe4dc;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#6b7079;">Desired move-in</td><td style="padding:12px 16px;border-bottom:1px solid #efe4dc;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;color:#1f2329;">${escapeHtml(data.moveIn)}</td></tr>
<tr><td valign="top" style="padding:12px 16px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#6b7079;">Notes</td><td style="padding:12px 16px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px;color:#1f2329;">${escapeHtml(data.notes).replace(/\n/g, '<br/>')}</td></tr>
</table>
</td></tr>

<tr><td class="px" style="padding:28px 40px 10px 40px;font-family:Arial,Helvetica,sans-serif;font-size:18px;line-height:24px;font-weight:bold;color:#1f2329;">Payment</td></tr>
<tr><td class="px" style="padding:0 40px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #efe4dc;border-radius:12px;">
<tr><td width="40%" style="padding:12px 16px;border-bottom:1px solid #efe4dc;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#6b7079;">Method</td><td style="padding:12px 16px;border-bottom:1px solid #efe4dc;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;color:#1f2329;">${escapeHtml(data.method)}</td></tr>
<tr><td style="padding:12px 16px;border-bottom:1px solid #efe4dc;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#6b7079;">Paid from number</td><td style="padding:12px 16px;border-bottom:1px solid #efe4dc;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;color:#1f2329;">${escapeHtml(data.paidFromPhone)}</td></tr>
<tr><td style="padding:12px 16px;border-bottom:1px solid #efe4dc;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#6b7079;">Date of payment</td><td style="padding:12px 16px;border-bottom:1px solid #efe4dc;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;color:#1f2329;">${escapeHtml(data.date)}</td></tr>
<tr><td bgcolor="#fcf6f2" style="padding:14px 16px;background-color:#fcf6f2;border-radius:0 0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#6b7079;">Amount paid</td><td bgcolor="#fcf6f2" style="padding:14px 16px;background-color:#fcf6f2;border-radius:0 0 12px 0;font-family:Arial,Helvetica,sans-serif;font-size:20px;font-weight:bold;color:#e8492c;">${escapeHtml(data.amountLabel)}</td></tr>
</table>
</td></tr>

<tr><td class="px" style="padding:28px 40px 32px 40px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:21px;color:#3a3f47;">Please confirm the payment on your MoMo account, then contact the guest to finalise the booking.</td></tr>

<tr><td bgcolor="#fcf6f2" class="px" style="background-color:#fcf6f2;border-radius:0 0 16px 16px;padding:20px 40px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#6b7079;">
You're receiving this because you manage ${escapeHtml(data.apartmentTitle)}.
</td></tr>
</table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr>
</table>
</body>
</html>
`;

    return { html, text };
  }
}
