export declare const PAYMENT_STATUSES: readonly ["Paid", "Due", "Overdue"];
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
export declare const TENANT_STATUSES: readonly ["Active", "Former"];
export type TenantStatus = (typeof TENANT_STATUSES)[number];
export declare class CreateTenantDto {
    name: string;
    email?: string;
    phone?: string;
    apartmentId?: string;
    apartmentName?: string;
    leaseStart?: string;
    leaseEnd?: string;
    paymentStatus?: PaymentStatus;
    status?: TenantStatus;
    notes?: string;
}
