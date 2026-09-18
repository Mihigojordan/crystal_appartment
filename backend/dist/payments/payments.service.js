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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const firestore_1 = require("firebase-admin/firestore");
const firebase_module_1 = require("../firebase/firebase.module");
const bookings_service_1 = require("../bookings/bookings.service");
const payment_confirmation_service_1 = require("./payment-confirmation.service");
const COLLECTION = 'payments';
const logger = new common_1.Logger('PaymentsService');
const AMOUNT_MATCH_TOLERANCE = 1;
let PaymentsService = class PaymentsService {
    firestore;
    bookingsService;
    confirmationService;
    constructor(firestore, bookingsService, confirmationService) {
        this.firestore = firestore;
        this.bookingsService = bookingsService;
        this.confirmationService = confirmationService;
    }
    db() {
        if (!this.firestore) {
            throw new common_1.ServiceUnavailableException('Firebase is not configured — check backend/.env');
        }
        return this.firestore;
    }
    toPayment(id, data) {
        return {
            id,
            tenantId: data.tenantId ?? null,
            tenantName: data.tenantName ?? null,
            apartmentId: data.apartmentId ?? null,
            apartmentName: data.apartmentName ?? null,
            amount: Number(data.amount) || 0,
            date: data.date ?? '',
            method: data.method ?? 'Other',
            status: data.status ?? 'Pending',
            notes: data.notes ?? null,
            bookingId: data.bookingId ?? null,
            guestPhone: data.guestPhone ?? null,
            screenshotUrl: data.screenshotUrl ?? null,
            extractedAmount: data.extractedAmount ?? null,
            extractedDate: data.extractedDate ?? null,
            matched: data.matched ?? null,
            contractSignDate: data.contractSignDate ?? null,
            approvalMessage: data.approvalMessage ?? null,
            whatsappNumber: data.whatsappNumber ?? null,
            contractRequirements: data.contractRequirements ?? null,
            createdAt: data.createdAt?.toDate().toISOString() ?? null,
        };
    }
    async list() {
        const snap = await this.db()
            .collection(COLLECTION)
            .orderBy('date', 'desc')
            .get();
        return snap.docs.map((doc) => this.toPayment(doc.id, doc.data()));
    }
    async findOne(id) {
        const doc = await this.db().collection(COLLECTION).doc(id).get();
        if (!doc.exists)
            throw new common_1.NotFoundException('Payment not found');
        return this.toPayment(doc.id, doc.data());
    }
    async create(dto) {
        const ref = await this.db()
            .collection(COLLECTION)
            .add({
            ...dto,
            status: dto.status ?? 'Paid',
            createdAt: firestore_1.FieldValue.serverTimestamp(),
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
        });
        return this.findOne(ref.id);
    }
    async createManual(dto) {
        const matched = dto.extractedAmount != null &&
            Math.abs(dto.extractedAmount - dto.amount) <= AMOUNT_MATCH_TOLERANCE;
        const ref = await this.db()
            .collection(COLLECTION)
            .add({
            tenantName: dto.guestName,
            guestPhone: dto.guestPhone,
            apartmentId: dto.apartmentId ?? null,
            apartmentName: dto.apartmentName ?? null,
            bookingId: dto.bookingId ?? null,
            amount: dto.amount,
            date: dto.date,
            method: dto.method,
            status: 'Pending',
            screenshotUrl: dto.screenshotUrl,
            extractedAmount: dto.extractedAmount ?? null,
            extractedDate: dto.extractedDate ?? null,
            matched,
            createdAt: firestore_1.FieldValue.serverTimestamp(),
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
        });
        return this.findOne(ref.id);
    }
    async update(id, dto) {
        const ref = this.db().collection(COLLECTION).doc(id);
        const doc = await ref.get();
        if (!doc.exists)
            throw new common_1.NotFoundException('Payment not found');
        const before = this.toPayment(id, doc.data());
        await ref.update({ ...dto, updatedAt: firestore_1.FieldValue.serverTimestamp() });
        const updated = await this.findOne(id);
        if (updated.status === 'Paid' && before.status !== 'Paid') {
            await this.onPaymentApproved(updated, {
                contractSignDate: dto.contractSignDate,
                approvalMessage: dto.approvalMessage,
                whatsappNumber: dto.whatsappNumber,
                contractRequirements: dto.contractRequirements,
            });
        }
        return updated;
    }
    async onPaymentApproved(payment, details) {
        let booking = null;
        if (payment.bookingId) {
            try {
                booking = await this.bookingsService.updateStatus(payment.bookingId, 'Confirmed');
            }
            catch (err) {
                logger.error(`Could not auto-confirm booking ${payment.bookingId}: ${err.message}`);
            }
        }
        try {
            const result = await this.confirmationService.sendConfirmationEmail(payment, booking, details);
            if (!result.sent) {
                logger.warn(`Confirmation email not sent for payment ${payment.id}: ${result.reason}`);
            }
        }
        catch (err) {
            logger.error(`Confirmation email failed for payment ${payment.id}: ${err.message}`);
        }
    }
    async remove(id) {
        const ref = this.db().collection(COLLECTION).doc(id);
        const doc = await ref.get();
        if (!doc.exists)
            throw new common_1.NotFoundException('Payment not found');
        await ref.delete();
        return { id };
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(firebase_module_1.FIRESTORE)),
    __metadata("design:paramtypes", [Object, bookings_service_1.BookingsService,
        payment_confirmation_service_1.PaymentConfirmationService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map