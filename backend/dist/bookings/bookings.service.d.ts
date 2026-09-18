import { Firestore } from 'firebase-admin/firestore';
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
export declare class BookingsService {
    private readonly firestore;
    constructor(firestore: Firestore | null);
    private db;
    private toBooking;
    create(dto: CreateBookingDto): Promise<Booking>;
    list(): Promise<Booking[]>;
    findOne(id: string): Promise<Booking>;
    updateStatus(id: string, status: BookingStatus): Promise<Booking>;
    remove(id: string): Promise<{
        id: string;
    }>;
}
