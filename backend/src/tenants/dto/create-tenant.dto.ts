import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export const PAYMENT_STATUSES = ['Paid', 'Due', 'Overdue'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const TENANT_STATUSES = ['Active', 'Former'] as const;
export type TenantStatus = (typeof TENANT_STATUSES)[number];

export class CreateTenantDto {
  @IsString()
  @IsNotEmpty()
  name: string;

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
