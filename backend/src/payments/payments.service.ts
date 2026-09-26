import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { FieldValue, Firestore, Timestamp } from 'firebase-admin/firestore';
import { FIRESTORE } from '../firebase/firebase.module';
import { BookingsService, Booking } from '../bookings/bookings.service';
import { TenantsService } from '../tenants/tenants.service';
import { ApartmentsService } from '../apartments/apartments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { CreateManualPaymentDto } from './dto/create-manual-payment.dto';
import { PaymentMethod, PaymentRecordStatus } from './dto/create-payment.dto';
import {
  PaymentConfirmationService,
  ApprovalDetails,
} from './payment-confirmation.service';
import { PesapalStatus } from './pesapal.service';

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
  pesapalOrderTrackingId: string | null;
  createdAt: string | null;
}

interface RawPaymentData {
  tenantId?: string | null;
  tenantName?: string | null;
  apartmentId?: string | null;
  apartmentName?: string | null;
  amount?: number;
  date?: string;
  method?: PaymentMethod;
  status?: PaymentRecordStatus;
  notes?: string | null;
  bookingId?: string | null;
  guestPhone?: string | null;
  screenshotUrl?: string | null;
  extractedAmount?: number | null;
  extractedDate?: string | null;
  matched?: boolean | null;
  contractSignDate?: string | null;
  approvalMessage?: string | null;
  whatsappNumber?: string | null;
  contractRequirements?: string | null;
  pesapalOrderTrackingId?: string | null;
  createdAt?: Timestamp;
}

const COLLECTION = 'payments';
const logger = new Logger('PaymentsService');

// A few francs of rounding slack for OCR/vision misreads — still counts as
// a match rather than forcing an exact cent-for-cent read off a screenshot.
const AMOUNT_MATCH_TOLERANCE = 1;

@Injectable()
export class PaymentsService {
  constructor(
    @Inject(FIRESTORE) private readonly firestore: Firestore | null,
    private readonly bookingsService: BookingsService,
    private readonly tenantsService: TenantsService,
    private readonly apartmentsService: ApartmentsService,
    private readonly confirmationService: PaymentConfirmationService,
  ) {}

  private db(): Firestore {
    if (!this.firestore) {
      throw new ServiceUnavailableException(
        'Firebase is not configured — check backend/.env',
      );
    }
    return this.firestore;
  }

  private toPayment(id: string, data: RawPaymentData): Payment {
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
      pesapalOrderTrackingId: data.pesapalOrderTrackingId ?? null,
      createdAt: data.createdAt?.toDate().toISOString() ?? null,
    };
  }

  async list(): Promise<Payment[]> {
    const snap = await this.db()
      .collection(COLLECTION)
      .orderBy('date', 'desc')
      .get();
    return snap.docs.map((doc) => this.toPayment(doc.id, doc.data()));
  }

  async findOne(id: string): Promise<Payment> {
    const doc = await this.db().collection(COLLECTION).doc(id).get();
    if (!doc.exists) throw new NotFoundException('Payment not found');
    return this.toPayment(doc.id, doc.data() as RawPaymentData);
  }

  async create(dto: CreatePaymentDto): Promise<Payment> {
    const ref = await this.db()
      .collection(COLLECTION)
      .add({
        ...dto,
        status: dto.status ?? 'Paid',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    return this.findOne(ref.id);
  }

  // Public — guests submit these from the booking flow after uploading a
  // MoMo screenshot. Always lands as "Pending"; an admin approves or
  // rejects it after checking the money actually arrived.
  async createManual(dto: CreateManualPaymentDto): Promise<Payment> {
    const matched =
      dto.extractedAmount != null &&
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
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    const payment = await this.findOne(ref.id);

    let booking: Booking | null = null;
    if (payment.bookingId) {
      try {
        booking = await this.bookingsService.findOne(payment.bookingId);
      } catch (err) {
        logger.error(
          `Could not look up booking ${payment.bookingId} for new-booking notification: ${(err as Error).message}`,
        );
      }
    }
    try {
      const result = await this.confirmationService.sendNewBookingAdminEmail(payment, booking);
      if (!result.sent) {
        logger.warn(`New-booking admin notification not sent for payment ${payment.id}: ${result.reason}`);
      }
    } catch (err) {
      logger.error(`New-booking admin notification failed for payment ${payment.id}: ${(err as Error).message}`);
    }

    return payment;
  }

  // Public — called right after a Pesapal order is submitted, before the
  // guest is redirected to Pesapal's hosted checkout. Lands as "Pending"
  // and is looked up again by pesapalOrderTrackingId once the guest is
  // redirected back (see confirmPesapalPayment).
  async createPesapalPending(data: {
    guestName: string;
    guestPhone?: string;
    apartmentId?: string;
    apartmentName?: string;
    bookingId?: string;
    amount: number;
    orderTrackingId: string;
  }): Promise<Payment> {
    const ref = await this.db()
      .collection(COLLECTION)
      .add({
        tenantName: data.guestName,
        guestPhone: data.guestPhone ?? null,
        apartmentId: data.apartmentId ?? null,
        apartmentName: data.apartmentName ?? null,
        bookingId: data.bookingId ?? null,
        amount: data.amount,
        date: new Date().toISOString().slice(0, 10),
        method: 'Card',
        status: 'Pending',
        pesapalOrderTrackingId: data.orderTrackingId,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    return this.findOne(ref.id);
  }

  // Public — called (from the guest's redirect back, and/or Pesapal's IPN
  // webhook) with a freshly re-checked status from Pesapal's own API.
  // Never trusts a client-supplied status — the caller must have gotten
  // `pesapalStatus` from PesapalService.getTransactionStatus() first.
  async confirmPesapalPayment(
    orderTrackingId: string,
    pesapalStatus: PesapalStatus,
  ): Promise<Payment> {
    const snap = await this.db()
      .collection(COLLECTION)
      .where('pesapalOrderTrackingId', '==', orderTrackingId)
      .limit(1)
      .get();
    if (snap.empty) {
      throw new NotFoundException('No payment found for this Pesapal order');
    }
    const doc = snap.docs[0];
    const before = this.toPayment(doc.id, doc.data() as RawPaymentData);

    const isCompleted = pesapalStatus.paymentStatus?.toUpperCase() === 'COMPLETED';
    if (isCompleted && before.status !== 'Paid') {
      await doc.ref.update({ status: 'Paid', updatedAt: FieldValue.serverTimestamp() });
    }
    const updated = await this.findOne(doc.id);

    if (updated.status === 'Paid' && before.status !== 'Paid') {
      await this.onPaymentApproved(updated, {
        approvalMessage: "Thank you for your payment! We're excited to welcome you.",
      });
    }

    return updated;
  }

  // Status corrections are always allowed (not just from "Pending") — an
  // admin who fat-fingered Approve/Reject can fix it here. Only a genuine
  // transition INTO "Paid" fires the booking auto-confirm + confirmation
  // email, so touching an already-Paid record again doesn't re-send it.
  async update(id: string, dto: UpdatePaymentDto): Promise<Payment> {
    const ref = this.db().collection(COLLECTION).doc(id);
    const doc = await ref.get();
    if (!doc.exists) throw new NotFoundException('Payment not found');
    const before = this.toPayment(id, doc.data() as RawPaymentData);

    await ref.update({ ...dto, updatedAt: FieldValue.serverTimestamp() });
    const updated = await this.findOne(id);

    if (updated.status === 'Paid' && before.status !== 'Paid') {
      await this.onPaymentApproved(updated, {
        contractSignDate: dto.contractSignDate,
        approvalMessage: dto.approvalMessage,
        whatsappNumber: dto.whatsappNumber,
        contractRequirements: dto.contractRequirements,
      });
    }

    if (updated.status === 'Failed' && before.status !== 'Failed') {
      await this.onPaymentRejected(updated, dto.rejectionReason);
    }

    return updated;
  }

  // Payments recorded directly by an admin (via the "Record Payment" form)
  // are linked to a tenant, not a booking, so there's no booking.guestEmail
  // to send to. Fall back to the tenant's own email in that case.
  private async resolveGuestEmail(
    payment: Payment,
    booking: Booking | null,
  ): Promise<string | undefined> {
    if (booking?.guestEmail) return booking.guestEmail;
    if (!payment.tenantId) return undefined;
    try {
      const tenant = await this.tenantsService.findOne(payment.tenantId);
      return tenant.email ?? undefined;
    } catch (err) {
      logger.error(
        `Could not look up tenant ${payment.tenantId} for confirmation email: ${(err as Error).message}`,
      );
      return undefined;
    }
  }

  private async onPaymentApproved(
    payment: Payment,
    details: ApprovalDetails,
  ): Promise<void> {
    let booking: Booking | null = null;
    if (payment.bookingId) {
      try {
        booking = await this.bookingsService.updateStatus(
          payment.bookingId,
          'Confirmed',
        );
      } catch (err) {
        logger.error(
          `Could not auto-confirm booking ${payment.bookingId}: ${(err as Error).message}`,
        );
      }
    }

    const guestEmail = await this.resolveGuestEmail(payment, booking);

    let monthlyRent: number | null = null;
    if (payment.apartmentId) {
      try {
        const apartment = await this.apartmentsService.findOne(payment.apartmentId);
        monthlyRent = apartment.rent;
      } catch (err) {
        logger.error(
          `Could not look up apartment ${payment.apartmentId} for confirmation email: ${(err as Error).message}`,
        );
      }
    }

    try {
      const result = await this.confirmationService.sendApprovedEmail(
        payment,
        booking,
        details,
        guestEmail,
        monthlyRent,
      );
      if (!result.sent) {
        logger.warn(
          `Approval email not sent for payment ${payment.id}: ${result.reason}`,
        );
      }
    } catch (err) {
      logger.error(
        `Approval email failed for payment ${payment.id}: ${(err as Error).message}`,
      );
    }
  }

  private async onPaymentRejected(
    payment: Payment,
    reason: string | undefined,
  ): Promise<void> {
    let booking: Booking | null = null;
    if (payment.bookingId) {
      try {
        booking = await this.bookingsService.updateStatus(
          payment.bookingId,
          'Cancelled',
        );
      } catch (err) {
        logger.error(
          `Could not auto-cancel booking ${payment.bookingId}: ${(err as Error).message}`,
        );
      }
    }

    const guestEmail = await this.resolveGuestEmail(payment, booking);

    try {
      const result = await this.confirmationService.sendRejectedEmail(
        payment,
        booking,
        reason?.trim() || 'The payment could not be verified.',
        guestEmail,
      );
      if (!result.sent) {
        logger.warn(
          `Rejection email not sent for payment ${payment.id}: ${result.reason}`,
        );
      }
    } catch (err) {
      logger.error(
        `Rejection email failed for payment ${payment.id}: ${(err as Error).message}`,
      );
    }
  }

  async remove(id: string): Promise<{ id: string }> {
    const ref = this.db().collection(COLLECTION).doc(id);
    const doc = await ref.get();
    if (!doc.exists) throw new NotFoundException('Payment not found');
    await ref.delete();
    return { id };
  }
}
