export declare class CreateBookingDto {
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    apartmentId: string;
    apartmentTitle: string;
    type: 'tour' | 'direct';
    tourDate?: string;
    tourTime?: string;
    moveIn?: string;
    notes?: string;
}
