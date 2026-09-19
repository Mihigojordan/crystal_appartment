import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const logger = new Logger('PesapalService');

const SANDBOX_BASE = 'https://cybqa.pesapal.com/pesapalv3';
const LIVE_BASE = 'https://pay.pesapal.com/v3';

export interface PesapalOrderResult {
  orderTrackingId: string;
  redirectUrl: string;
}

export interface PesapalStatus {
  orderTrackingId: string;
  paymentStatus: string;
  paymentMethod: string | null;
  amount: number | null;
  confirmationCode: string | null;
}

@Injectable()
export class PesapalService {
  private token: string | null = null;
  private tokenExpiresAt = 0;
  private ipnId: string | null = null;

  constructor(private readonly config: ConfigService) {}

  private configured(): boolean {
    return Boolean(
      this.config.get<string>('PESAPAL_CONSUMER_KEY') &&
        this.config.get<string>('PESAPAL_CONSUMER_SECRET'),
    );
  }

  private baseUrl(): string {
    return this.config.get<string>('PESAPAL_ENV') === 'live'
      ? LIVE_BASE
      : SANDBOX_BASE;
  }

  private async getToken(): Promise<string> {
    if (!this.configured()) {
      throw new ServiceUnavailableException(
        'Pesapal is not configured — check backend/.env',
      );
    }
    if (this.token && Date.now() < this.tokenExpiresAt) {
      return this.token;
    }

    const res = await fetch(`${this.baseUrl()}/api/Auth/RequestToken`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        consumer_key: this.config.get<string>('PESAPAL_CONSUMER_KEY'),
        consumer_secret: this.config.get<string>('PESAPAL_CONSUMER_SECRET'),
      }),
    });
    const data = (await res.json()) as {
      token?: string;
      expiryDate?: string;
      error?: unknown;
      message?: string;
    };
    if (!res.ok || !data.token) {
      logger.error(`Pesapal auth failed: ${res.status} ${JSON.stringify(data)}`);
      throw new BadRequestException('Could not authenticate with Pesapal');
    }

    this.token = data.token;
    // Tokens are short-lived (~5 min) — refresh a little early to be safe.
    this.tokenExpiresAt = Date.now() + 4 * 60 * 1000;
    return this.token;
  }

  private async getIpnId(): Promise<string> {
    if (this.ipnId) return this.ipnId;

    const ipnUrl = this.config.get<string>('PESAPAL_IPN_URL');
    if (!ipnUrl) {
      throw new ServiceUnavailableException(
        'PESAPAL_IPN_URL is not set — check backend/.env',
      );
    }

    const token = await this.getToken();
    const res = await fetch(`${this.baseUrl()}/api/URLSetup/RegisterIPN`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ url: ipnUrl, ipn_notification_type: 'GET' }),
    });
    const data = (await res.json()) as { ipn_id?: string; error?: unknown };
    if (!res.ok || !data.ipn_id) {
      logger.error(`Pesapal IPN registration failed: ${res.status} ${JSON.stringify(data)}`);
      throw new BadRequestException('Could not register with Pesapal');
    }

    this.ipnId = data.ipn_id;
    return this.ipnId;
  }

  async submitOrder(order: {
    merchantReference: string;
    amount: number;
    currency: string;
    description: string;
    email: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
  }): Promise<PesapalOrderResult> {
    const token = await this.getToken();
    const ipnId = await this.getIpnId();
    const callbackUrl = this.config.get<string>('PESAPAL_CALLBACK_URL');
    if (!callbackUrl) {
      throw new ServiceUnavailableException(
        'PESAPAL_CALLBACK_URL is not set — check backend/.env',
      );
    }

    const feePercent = Number(this.config.get<string>('PESAPAL_FEE_PERCENT')) || 0;
    const amount = Math.round(order.amount * (1 + feePercent / 100) * 100) / 100;

    const res = await fetch(`${this.baseUrl()}/api/Transactions/SubmitOrderRequest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        id: order.merchantReference,
        currency: order.currency,
        amount,
        description: order.description,
        callback_url: callbackUrl,
        notification_id: ipnId,
        billing_address: {
          email_address: order.email,
          phone_number: order.phone ?? '',
          first_name: order.firstName ?? '',
          last_name: order.lastName ?? '',
        },
      }),
    });
    const data = (await res.json()) as {
      order_tracking_id?: string;
      redirect_url?: string;
      error?: unknown;
      message?: string;
    };
    if (!res.ok || !data.order_tracking_id || !data.redirect_url) {
      logger.error(`Pesapal order submission failed: ${res.status} ${JSON.stringify(data)}`);
      throw new BadRequestException('Could not start the Pesapal payment');
    }

    return { orderTrackingId: data.order_tracking_id, redirectUrl: data.redirect_url };
  }

  async getTransactionStatus(orderTrackingId: string): Promise<PesapalStatus> {
    const token = await this.getToken();
    const res = await fetch(
      `${this.baseUrl()}/api/Transactions/GetTransactionStatus?orderTrackingId=${encodeURIComponent(orderTrackingId)}`,
      {
        headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
      },
    );
    const data = (await res.json()) as {
      payment_status_description?: string;
      payment_method?: string;
      amount?: number;
      confirmation_code?: string;
      error?: unknown;
    };
    if (!res.ok) {
      logger.error(`Pesapal status check failed: ${res.status} ${JSON.stringify(data)}`);
      throw new BadRequestException('Could not check the Pesapal payment status');
    }

    return {
      orderTrackingId,
      paymentStatus: data.payment_status_description ?? 'UNKNOWN',
      paymentMethod: data.payment_method ?? null,
      amount: data.amount ?? null,
      confirmationCode: data.confirmation_code ?? null,
    };
  }
}
