export declare const MANUAL_PAYMENT_METHODS: readonly ["MoMo", "Airtel"];
export type ManualPaymentMethod = (typeof MANUAL_PAYMENT_METHODS)[number];
export declare class CreateManualPaymentDto {
    guestName: string;
    guestPhone: string;
    apartmentId?: string;
    apartmentName?: string;
    bookingId?: string;
    method: ManualPaymentMethod;
    amount: number;
    date: string;
    screenshotUrl: string;
    extractedAmount?: number;
    extractedDate?: string;
}
