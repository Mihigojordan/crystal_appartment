export declare const PAYMENT_METHODS: readonly ["Cash", "Card", "Bank Transfer", "MoMo", "Airtel", "Other"];
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
export declare const PAYMENT_RECORD_STATUSES: readonly ["Paid", "Pending", "Partial", "Failed"];
export type PaymentRecordStatus = (typeof PAYMENT_RECORD_STATUSES)[number];
export declare class CreatePaymentDto {
    tenantId?: string;
    tenantName?: string;
    apartmentId?: string;
    apartmentName?: string;
    amount: number;
    date: string;
    method: PaymentMethod;
    status?: PaymentRecordStatus;
    notes?: string;
    bookingId?: string;
    guestPhone?: string;
    screenshotUrl?: string;
    extractedAmount?: number;
    extractedDate?: string;
    matched?: boolean;
}
