import { ConfigService } from '@nestjs/config';
export interface ExtractedPaymentInfo {
    amount: number | null;
    date: string | null;
    phone: string | null;
    provider: string | null;
    reference: string | null;
}
export declare class PaymentExtractionService {
    private readonly config;
    constructor(config: ConfigService);
    extractFromScreenshot(imageUrl: string): Promise<ExtractedPaymentInfo>;
}
