import { Firestore } from 'firebase-admin/firestore';
import { BookingsService } from '../bookings/bookings.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { CreateManualPaymentDto } from './dto/create-manual-payment.dto';
import { PaymentMethod, PaymentRecordStatus } from './dto/create-payment.dto';
import { PaymentConfirmationService } from './payment-confirmation.service';
export interface Payment {
    id: string;
    tenantId: string | null;
    tenantName: string | null;
    apartmentId: string | null;
    apartmentName: string | null;
    amount: number;
    date: string;
    method: PaymentMethod;
    status: PaymentRecordStatus;
    notes: string | null;
    bookingId: string | null;
    guestPhone: string | null;
    screenshotUrl: string | null;
    extractedAmount: number | null;
    extractedDate: string | null;
    matched: boolean | null;
    contractSignDate: string | null;
    approvalMessage: string | null;
    whatsappNumber: string | null;
    contractRequirements: string | null;
    createdAt: string | null;
}
export declare class PaymentsService {
    private readonly firestore;
    private readonly bookingsService;
    private readonly confirmationService;
    constructor(firestore: Firestore | null, bookingsService: BookingsService, confirmationService: PaymentConfirmationService);
    private db;
    private toPayment;
    list(): Promise<Payment[]>;
    findOne(id: string): Promise<Payment>;
    create(dto: CreatePaymentDto): Promise<Payment>;
    createManual(dto: CreateManualPaymentDto): Promise<Payment>;
    update(id: string, dto: UpdatePaymentDto): Promise<Payment>;
    private onPaymentApproved;
    remove(id: string): Promise<{
        id: string;
    }>;
}
