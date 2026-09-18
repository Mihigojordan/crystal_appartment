import { ConfigService } from '@nestjs/config';
import { Payment } from './payments.service';
import { Booking } from '../bookings/bookings.service';
export interface ApprovalDetails {
    contractSignDate?: string | null;
    approvalMessage?: string | null;
    whatsappNumber?: string | null;
    contractRequirements?: string | null;
}
export declare class PaymentConfirmationService {
    private readonly config;
    constructor(config: ConfigService);
    sendConfirmationEmail(payment: Payment, booking: Booking | null, details: ApprovalDetails): Promise<{
        sent: boolean;
        reason?: string;
    }>;
    private buildEmail;
}
