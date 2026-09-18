import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { PaymentsService } from './payments.service';
import { PaymentExtractionService } from './payment-extraction.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { CreateManualPaymentDto } from './dto/create-manual-payment.dto';
import { ExtractPaymentScreenshotDto } from './dto/extract-payment-screenshot.dto';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly paymentExtractionService: PaymentExtractionService,
  ) {}

  // Public — the booking flow's mobile money step reads a screenshot before
  // the guest submits, so they can fix a typo before it ever hits the admin
  // queue.
  @Post('extract')
  extract(@Body() dto: ExtractPaymentScreenshotDto) {
    return this.paymentExtractionService.extractFromScreenshot(dto.imageUrl);
  }

  // Public — guests submit their MoMo/Airtel proof from the booking flow,
  // unauthenticated, same as the booking and message forms.
  @Post('manual')
  createManual(@Body() dto: CreateManualPaymentDto) {
    return this.paymentsService.createManual(dto);
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
