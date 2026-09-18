import type { PaymentStatus, TenantStatus } from './create-tenant.dto';
export declare class UpdateTenantDto {
    name?: string;
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
