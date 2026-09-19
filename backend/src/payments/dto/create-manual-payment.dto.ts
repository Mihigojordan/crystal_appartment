import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export const MANUAL_PAYMENT_METHODS = ['MoMo'] as const;
export type ManualPaymentMethod = (typeof MANUAL_PAYMENT_METHODS)[number];

export class CreateManualPaymentDto {
  @IsString()
  @IsNotEmpty()
  guestName: string;

  @IsString()
  @IsNotEmpty()
  guestPhone: string;

  @IsOptional()
  @IsString()
  apartmentId?: string;

  @IsOptional()
  @IsString()
  apartmentName?: string;

  @IsOptional()
  @IsString()
  bookingId?: string;

  @IsIn(MANUAL_PAYMENT_METHODS)
  method: ManualPaymentMethod;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsNotEmpty()
  screenshotUrl: string;

  @IsOptional()
  @IsNumber()
  extractedAmount?: number;

  @IsOptional()
  @IsString()
  extractedDate?: string;
}
