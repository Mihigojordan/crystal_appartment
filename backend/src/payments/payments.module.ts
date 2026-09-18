import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { BookingsModule } from '../bookings/bookings.module';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentExtractionService } from './payment-extraction.service';
import { PaymentConfirmationService } from './payment-confirmation.service';

@Module({
  imports: [AuthModule, BookingsModule],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    PaymentExtractionService,
    PaymentConfirmationService,
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
