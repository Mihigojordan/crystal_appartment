import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export const PAYMENT_METHODS = [
  'Cash',
  'Card',
  'Bank Transfer',
  'MoMo',
  'Airtel',
  'Other',
] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_RECORD_STATUSES = [
  'Paid',
  'Pending',
  'Partial',
  'Failed',
] as const;
export type PaymentRecordStatus = (typeof PAYMENT_RECORD_STATUSES)[number];

export class CreatePaymentDto {
  @IsOptional()
  @IsString()
  tenantId?: string;

  @IsOptional()
  @IsString()
  tenantName?: string;

  @IsOptional()
  @IsString()
  apartmentId?: string;

  @IsOptional()
  @IsString()
  apartmentName?: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  @IsNotEmpty()
  date: string;

  @IsIn(PAYMENT_METHODS)
  method: PaymentMethod;

  @IsOptional()
  @IsIn(PAYMENT_RECORD_STATUSES)
  status?: PaymentRecordStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  // Guest-submitted mobile money proof — set on manual payment submissions,
  // absent on admin-recorded ones.
  @IsOptional()
  @IsString()
  bookingId?: string;

  @IsOptional()
  @IsString()
  guestPhone?: string;

  @IsOptional()
  @IsString()
  screenshotUrl?: string;

  @IsOptional()
  @IsNumber()
  extractedAmount?: number;

  @IsOptional()
  @IsString()
  extractedDate?: string;

  @IsOptional()
  @IsBoolean()
  matched?: boolean;
}
