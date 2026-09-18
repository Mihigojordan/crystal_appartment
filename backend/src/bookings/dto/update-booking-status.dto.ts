import { IsIn } from 'class-validator';

export const BOOKING_STATUSES = ['Pending', 'Confirmed', 'Cancelled'] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export class UpdateBookingStatusDto {
  @IsIn(BOOKING_STATUSES)
  status: BookingStatus;
}
