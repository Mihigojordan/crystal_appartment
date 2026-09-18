import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
export declare class BookingsController {
    private readonly bookingsService;
    constructor(bookingsService: BookingsService);
    create(dto: CreateBookingDto): Promise<import("./bookings.service").Booking>;
    list(): Promise<import("./bookings.service").Booking[]>;
    findOne(id: string): Promise<import("./bookings.service").Booking>;
    updateStatus(id: string, dto: UpdateBookingStatusDto): Promise<import("./bookings.service").Booking>;
    remove(id: string): Promise<{
        id: string;
    }>;
}
