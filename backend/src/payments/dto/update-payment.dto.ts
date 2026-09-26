import {
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { PAYMENT_METHODS, PAYMENT_RECORD_STATUSES } from './create-payment.dto';
import type { PaymentMethod, PaymentRecordStatus } from './create-payment.dto';

export class UpdatePaymentDto {
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

  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsIn(PAYMENT_METHODS)
  method?: PaymentMethod;

  @IsOptional()
  @IsIn(PAYMENT_RECORD_STATUSES)
  status?: PaymentRecordStatus;

  @IsOptional()
  @IsString()
  notes?: string;

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

  // Set when approving a manual payment to "Paid" — collected via the
  // approve popup and sent straight to the guest's inbox as their receipt.
  // Triggers PaymentsService.update()'s confirmation email.
  @IsOptional()
  @IsString()
  contractSignDate?: string;

  @IsOptional()
  @IsString()
  approvalMessage?: string;

  @IsOptional()
  @IsString()
  whatsappNumber?: string;

  @IsOptional()
  @IsString()
  contractRequirements?: string;

  // Set when rejecting a payment (status -> "Failed") — collected via the
  // reject popup and sent to the guest explaining why. Triggers
  // PaymentsService.update()'s rejection email.
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
