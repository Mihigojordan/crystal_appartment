"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentExtractionService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const logger = new common_1.Logger('PaymentExtractionService');
const SYSTEM_PROMPT = 'You read mobile money (MTN MoMo, Airtel Money) payment confirmation screenshots and extract the transaction details. ' +
    'Respond with ONLY a JSON object, no prose: ' +
    '{"amount": number|null, "date": "YYYY-MM-DD"|null, "phone": string|null, "provider": "MoMo"|"Airtel"|null, "reference": string|null}. ' +
    'amount must be the plain numeric transaction amount with no currency symbol, letters, or thousands separators. ' +
    'If the screenshot is not a payment confirmation, or a field cannot be read, use null for that field.';
let PaymentExtractionService = class PaymentExtractionService {
    config;
    constructor(config) {
        this.config = config;
    }
    async extractFromScreenshot(imageUrl) {
        const apiKey = this.config.get('OPENAI_API_KEY');
        if (!apiKey) {
            throw new common_1.ServiceUnavailableException('Payment screenshot verification is not configured — check backend/.env');
        }
        let res;
        try {
            res = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    response_format: { type: 'json_object' },
                    max_tokens: 300,
                    messages: [
                        { role: 'system', content: SYSTEM_PROMPT },
                        {
                            role: 'user',
                            content: [
                                { type: 'text', text: 'Extract the payment details from this screenshot.' },
                                { type: 'image_url', image_url: { url: imageUrl } },
                            ],
                        },
                    ],
                }),
            });
        }
        catch (err) {
            logger.error(`OpenAI request failed: ${err.message}`);
            throw new common_1.BadRequestException('Could not reach the screenshot verification service — try again shortly');
        }
        if (!res.ok) {
            logger.error(`OpenAI extraction failed: ${res.status} ${await res.text()}`);
            throw new common_1.BadRequestException('Could not read the screenshot — try a clearer image');
        }
        const data = (await res.json());
        const content = data.choices?.[0]?.message?.content;
        if (!content) {
            throw new common_1.BadRequestException('Could not read the screenshot — try a clearer image');
        }
        try {
            const parsed = JSON.parse(content);
            return {
                amount: typeof parsed.amount === 'number' ? parsed.amount : null,
                date: typeof parsed.date === 'string' ? parsed.date : null,
                phone: typeof parsed.phone === 'string' ? parsed.phone : null,
                provider: typeof parsed.provider === 'string' ? parsed.provider : null,
                reference: typeof parsed.reference === 'string' ? parsed.reference : null,
            };
        }
        catch {
            throw new common_1.BadRequestException('Could not read the screenshot — try a clearer image');
        }
    }
};
exports.PaymentExtractionService = PaymentExtractionService;
exports.PaymentExtractionService = PaymentExtractionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PaymentExtractionService);
//# sourceMappingURL=payment-extraction.service.js.map