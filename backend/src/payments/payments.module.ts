import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { BookingsModule } from '../bookings/bookings.module';
import { TenantsModule } from '../tenants/tenants.module';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentExtractionService } from './payment-extraction.service';
import { PaymentConfirmationService } from './payment-confirmation.service';
import { PesapalService } from './pesapal.service';

@Module({
  imports: [AuthModule, BookingsModule, TenantsModule],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    PaymentExtractionService,
    PaymentConfirmationService,
    PesapalService,
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
