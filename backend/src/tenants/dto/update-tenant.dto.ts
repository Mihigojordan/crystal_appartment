import { IsEmail, IsIn, IsOptional, IsString } from 'class-validator';
import { PAYMENT_STATUSES, TENANT_STATUSES } from './create-tenant.dto';
import type { PaymentStatus, TenantStatus } from './create-tenant.dto';

export class UpdateTenantDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  apartmentId?: string;

  @IsOptional()
  @IsString()
  apartmentName?: string;

  @IsOptional()
  @IsString()
  leaseStart?: string;

  @IsOptional()
  @IsString()
  leaseEnd?: string;

  @IsOptional()
  @IsIn(PAYMENT_STATUSES)
  paymentStatus?: PaymentStatus;

  @IsOptional()
  @IsIn(TENANT_STATUSES)
  status?: TenantStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
