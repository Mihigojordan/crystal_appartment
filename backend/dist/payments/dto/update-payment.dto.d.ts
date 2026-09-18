import type { PaymentMethod, PaymentRecordStatus } from './create-payment.dto';
export declare class UpdatePaymentDto {
    tenantId?: string;
    tenantName?: string;
    apartmentId?: string;
    apartmentName?: string;
    amount?: number;
    date?: string;
    method?: PaymentMethod;
    status?: PaymentRecordStatus;
    notes?: string;
    bookingId?: string;
    guestPhone?: string;
    screenshotUrl?: string;
    extractedAmount?: number;
    extractedDate?: string;
    matched?: boolean;
    contractSignDate?: string;
    approvalMessage?: string;
    whatsappNumber?: string;
    contractRequirements?: string;
}
