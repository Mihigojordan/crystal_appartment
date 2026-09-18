export declare const BOOKING_STATUSES: readonly ["Pending", "Confirmed", "Cancelled"];
export type BookingStatus = (typeof BOOKING_STATUSES)[number];
export declare class UpdateBookingStatusDto {
    status: BookingStatus;
}
