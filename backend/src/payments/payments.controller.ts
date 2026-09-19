import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { PaymentsService } from './payments.service';
import { PaymentExtractionService } from './payment-extraction.service';
import { PesapalService } from './pesapal.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { CreateManualPaymentDto } from './dto/create-manual-payment.dto';
import { ExtractPaymentScreenshotDto } from './dto/extract-payment-screenshot.dto';
import { CreatePesapalOrderDto } from './dto/create-pesapal-order.dto';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly paymentExtractionService: PaymentExtractionService,
    private readonly pesapalService: PesapalService,
  ) {}

  // Public — the booking flow's mobile money step reads a screenshot before
  // the guest submits, so they can fix a typo before it ever hits the admin
  // queue.
  @Post('extract')
  extract(@Body() dto: ExtractPaymentScreenshotDto) {
    return this.paymentExtractionService.extractFromScreenshot(dto.imageUrl);
  }

  // Public — guests submit their MoMo proof from the booking flow,
  // unauthenticated, same as the booking and message forms.
  @Post('manual')
  createManual(@Body() dto: CreateManualPaymentDto) {
    return this.paymentsService.createManual(dto);
  }

  // Public — the booking flow's card step calls this to get Pesapal's
  // hosted-checkout redirect URL. Records a "Pending" payment first so the
  // guest's redirect back (or Pesapal's IPN) has something to confirm.
  @Post('pesapal/create-order')
  async createPesapalOrder(@Body() dto: CreatePesapalOrderDto) {
    const merchantReference = `crystal-${Date.now()}`;
    const order = await this.pesapalService.submitOrder({
      merchantReference,
      amount: dto.amount,
      currency: 'USD',
      description: `Booking deposit — ${dto.apartmentName ?? 'Crystal Guest House'}`,
      email: dto.guestEmail,
      phone: dto.guestPhone,
      firstName: dto.guestName,
    });
    await this.paymentsService.createPesapalPending({
      guestName: dto.guestName,
      guestPhone: dto.guestPhone,
      apartmentId: dto.apartmentId,
      apartmentName: dto.apartmentName,
      bookingId: dto.bookingId,
      amount: dto.amount,
      orderTrackingId: order.orderTrackingId,
    });
    return order;
  }

  // Public — the guest's browser hits this after Pesapal redirects them
  // back from checkout, to find out (and record) whether the payment
  // actually went through. Always re-checks with Pesapal's API first.
  @Get('pesapal/status/:orderTrackingId')
  async pesapalStatus(@Param('orderTrackingId') orderTrackingId: string) {
    const status = await this.pesapalService.getTransactionStatus(orderTrackingId);
    return this.paymentsService.confirmPesapalPayment(orderTrackingId, status);
  }

  // Public and unauthenticated on purpose — this is Pesapal's own server
  // calling back (IPN), not a logged-in guest. Only meaningful once
  // PESAPAL_IPN_URL in backend/.env actually points here.
  @Get('pesapal/ipn')
  async pesapalIpn(
    @Query('OrderTrackingId') orderTrackingId: string,
    @Query('OrderNotificationType') notificationType: string,
    @Query('OrderMerchantReference') merchantReference: string,
  ) {
    const status = await this.pesapalService.getTransactionStatus(orderTrackingId);
    await this.paymentsService.confirmPesapalPayment(orderTrackingId, status);
    return {
      orderNotificationType: notificationType,
      orderTrackingId,
      orderMerchantReference: merchantReference,
      status: 200,
    };
  }

  @Get()
  @UseGuards(FirebaseAuthGuard)
  list() {
    return this.paymentsService.list();
  }

  @Get(':id')
  @UseGuards(FirebaseAuthGuard)
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  @Post()
  @UseGuards(FirebaseAuthGuard)
  create(@Body() dto: CreatePaymentDto) {
    return this.paymentsService.create(dto);
  }

  @Patch(':id')
  @UseGuards(FirebaseAuthGuard)
  update(@Param('id') id: string, @Body() dto: UpdatePaymentDto) {
    return this.paymentsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(FirebaseAuthGuard)
  remove(@Param('id') id: string) {
    return this.paymentsService.remove(id);
  }
}
