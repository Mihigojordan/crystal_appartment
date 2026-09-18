import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateBookingDto {
  @IsString()
  @IsNotEmpty()
  guestName: string;

  @IsEmail()
  guestEmail: string;

  @IsString()
  @IsNotEmpty()
  guestPhone: string;

  @IsString()
  @IsNotEmpty()
  apartmentId: string;

  @IsString()
  @IsNotEmpty()
  apartmentTitle: string;

  @IsIn(['tour', 'direct'])
  type: 'tour' | 'direct';

  @IsOptional()
  @IsString()
  tourDate?: string;

  @IsOptional()
  @IsString()
  tourTime?: string;

  @IsOptional()
  @IsString()
  moveIn?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
