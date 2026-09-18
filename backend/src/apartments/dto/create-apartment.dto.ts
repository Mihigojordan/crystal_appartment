import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export const APARTMENT_STATUSES = [
  'Occupied',
  'Vacant',
  'Maintenance',
] as const;
export type ApartmentStatus = (typeof APARTMENT_STATUSES)[number];

export class CreateApartmentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  propertyType?: string;

  @IsOptional()
  @IsString()
  unitNumber?: string;

  @IsOptional()
  @IsString()
  listingVisibility?: string;

  @IsOptional()
  @IsString()
  tenant?: string;

  @IsNumber()
  @Min(0)
  rent: number;

  @IsIn(APARTMENT_STATUSES)
  status: ApartmentStatus;

  @IsOptional()
  @IsNumber()
  bedrooms?: number;

  @IsOptional()
  @IsNumber()
  bathrooms?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sqft?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxOccupancy?: number;

  @IsOptional()
  @IsString()
  floorLevel?: string;

  @IsOptional()
  @IsString()
  furnishingStatus?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  streetAddress?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  neighborhood?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsString()
  googleMapsLink?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  gallery?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  neighborhoodHighlights?: string[];

  @IsOptional()
  @IsString()
  billingCycle?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  dailyRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sixMonthRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  yearlyRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  securityDeposit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  longStayDiscount?: number;

  @IsOptional()
  @IsString()
  minimumStay?: string;

  @IsOptional()
  @IsString()
  petPolicy?: string;

  @IsOptional()
  @IsString()
  smokingPolicy?: string;

  @IsOptional()
  @IsString()
  cancellationPolicy?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  utilitiesIncluded?: string[];

  @IsOptional()
  @IsString()
  additionalNotes?: string;

  @IsOptional()
  @IsString()
  availableFrom?: string;

  @IsOptional()
  @IsString()
  videoTourUrl?: string;
}
