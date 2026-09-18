import { PaymentsService } from './payments.service';
import { PaymentExtractionService } from './payment-extraction.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { CreateManualPaymentDto } from './dto/create-manual-payment.dto';
import { ExtractPaymentScreenshotDto } from './dto/extract-payment-screenshot.dto';
export declare class PaymentsController {
    private readonly paymentsService;
    private readonly paymentExtractionService;
    constructor(paymentsService: PaymentsService, paymentExtractionService: PaymentExtractionService);
    extract(dto: ExtractPaymentScreenshotDto): Promise<import("./payment-extraction.service").ExtractedPaymentInfo>;
    createManual(dto: CreateManualPaymentDto): Promise<import("./payments.service").Payment>;
    list(): Promise<import("./payments.service").Payment[]>;
    findOne(id: string): Promise<import("./payments.service").Payment>;
    create(dto: CreatePaymentDto): Promise<import("./payments.service").Payment>;
    update(id: string, dto: UpdatePaymentDto): Promise<import("./payments.service").Payment>;
    remove(id: string): Promise<{
        id: string;
    }>;
}
