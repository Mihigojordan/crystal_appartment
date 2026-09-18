import {
  Inject,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { FieldValue, Firestore, Timestamp } from 'firebase-admin/firestore';
import { FIRESTORE } from '../firebase/firebase.module';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingStatus } from './dto/update-booking-status.dto';

export interface Booking {
  id: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  apartmentId: string;
  apartmentTitle: string;
  type: 'tour' | 'direct';
  tourDate: string | null;
  tourTime: string | null;
  moveIn: string | null;
  notes: string | null;
  status: BookingStatus;
  createdAt: string | null;
}

interface RawBookingData {
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  apartmentId?: string;
  apartmentTitle?: string;
  type?: 'tour' | 'direct';
  tourDate?: string | null;
  tourTime?: string | null;
  moveIn?: string | null;
  notes?: string | null;
  status?: BookingStatus;
  createdAt?: Timestamp;
}

const COLLECTION = 'bookings';

@Injectable()
export class BookingsService {
  constructor(
    @Inject(FIRESTORE) private readonly firestore: Firestore | null,
  ) {}

  private db(): Firestore {
    if (!this.firestore) {
      throw new ServiceUnavailableException(
        'Firebase is not configured — check backend/.env',
      );
    }
    return this.firestore;
  }

  private toBooking(id: string, data: RawBookingData): Booking {
    return {
      id,
      guestName: data.guestName ?? '',
      guestEmail: data.guestEmail ?? '',
      guestPhone: data.guestPhone ?? '',
      apartmentId: data.apartmentId ?? '',
      apartmentTitle: data.apartmentTitle ?? '',
      type: data.type ?? 'direct',
      tourDate: data.tourDate ?? null,
      tourTime: data.tourTime ?? null,
      moveIn: data.moveIn ?? null,
      notes: data.notes ?? null,
      status: data.status ?? 'Pending',
      createdAt: data.createdAt?.toDate().toISOString() ?? null,
    };
  }

  async create(dto: CreateBookingDto): Promise<Booking> {
    const ref = await this.db()
      .collection(COLLECTION)
      .add({
        ...dto,
        tourDate: dto.tourDate ?? null,
        tourTime: dto.tourTime ?? null,
        moveIn: dto.moveIn ?? null,
        notes: dto.notes ?? null,
        status: 'Pending',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    const doc = await ref.get();
    return this.toBooking(doc.id, doc.data() as RawBookingData);
  }

  async list(): Promise<Booking[]> {
    const snap = await this.db()
      .collection(COLLECTION)
      .orderBy('createdAt', 'desc')
      .get();
    return snap.docs.map((doc) => this.toBooking(doc.id, doc.data()));
  }

  async findOne(id: string): Promise<Booking> {
    const doc = await this.db().collection(COLLECTION).doc(id).get();
    if (!doc.exists) throw new NotFoundException('Booking not found');
    return this.toBooking(doc.id, doc.data() as RawBookingData);
  }

  async updateStatus(id: string, status: BookingStatus): Promise<Booking> {
    const ref = this.db().collection(COLLECTION).doc(id);
    const doc = await ref.get();
    if (!doc.exists) throw new NotFoundException('Booking not found');
    await ref.update({ status, updatedAt: FieldValue.serverTimestamp() });
    const updated = await ref.get();
    return this.toBooking(updated.id, updated.data() as RawBookingData);
  }

  async remove(id: string): Promise<{ id: string }> {
    const ref = this.db().collection(COLLECTION).doc(id);
    const doc = await ref.get();
    if (!doc.exists) throw new NotFoundException('Booking not found');
    await ref.delete();
    return { id };
  }
}
