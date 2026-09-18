import {
  Inject,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { FieldValue, Firestore } from 'firebase-admin/firestore';
import { FIRESTORE } from '../firebase/firebase.module';
import { CreateApartmentDto } from './dto/create-apartment.dto';
import { UpdateApartmentDto } from './dto/update-apartment.dto';
import { ApartmentStatus } from './dto/create-apartment.dto';

export interface Apartment {
  id: string;
  name: string;
  propertyType: string | null;
  unitNumber: string | null;
  listingVisibility: string | null;
  tenant: string | null;
  rent: number;
  status: ApartmentStatus;
  bedrooms: number | null;
  bathrooms: number | null;
  sqft: number | null;
  maxOccupancy: number | null;
  floorLevel: string | null;
  furnishingStatus: string | null;
  location: string | null;
  streetAddress: string | null;
  city: string | null;
  region: string | null;
  neighborhood: string | null;
  postalCode: string | null;
  googleMapsLink: string | null;
  description: string | null;
  image: string | null;
  gallery: string[];
  amenities: string[];
  neighborhoodHighlights: string[];
  billingCycle: string | null;
  dailyRate: number | null;
  sixMonthRate: number | null;
  yearlyRate: number | null;
  securityDeposit: number | null;
  longStayDiscount: number | null;
  minimumStay: string | null;
  petPolicy: string | null;
  smokingPolicy: string | null;
  cancellationPolicy: string | null;
  utilitiesIncluded: string[];
  additionalNotes: string | null;
  availableFrom: string | null;
  videoTourUrl: string | null;
}

type RawApartmentData = Partial<Omit<Apartment, 'id'>>;

const COLLECTION = 'apartments';

@Injectable()
export class ApartmentsService {
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

  private toApartment(id: string, data: RawApartmentData): Apartment {
    return {
      id,
      name: data.name ?? '',
      propertyType: data.propertyType ?? null,
      unitNumber: data.unitNumber ?? null,
      listingVisibility: data.listingVisibility ?? null,
      tenant: data.tenant ?? null,
      rent: Number(data.rent) || 0,
      status: data.status ?? 'Vacant',
      bedrooms: data.bedrooms ?? null,
      bathrooms: data.bathrooms ?? null,
      sqft: data.sqft ?? null,
      maxOccupancy: data.maxOccupancy ?? null,
      floorLevel: data.floorLevel ?? null,
      furnishingStatus: data.furnishingStatus ?? null,
      location: data.location ?? null,
      streetAddress: data.streetAddress ?? null,
      city: data.city ?? null,
      region: data.region ?? null,
      neighborhood: data.neighborhood ?? null,
      postalCode: data.postalCode ?? null,
      googleMapsLink: data.googleMapsLink ?? null,
      description: data.description ?? null,
      image: data.image ?? null,
      gallery: data.gallery ?? [],
      amenities: data.amenities ?? [],
      neighborhoodHighlights: data.neighborhoodHighlights ?? [],
      billingCycle: data.billingCycle ?? null,
      dailyRate: data.dailyRate ?? null,
      sixMonthRate: data.sixMonthRate ?? null,
      yearlyRate: data.yearlyRate ?? null,
      securityDeposit: data.securityDeposit ?? null,
      longStayDiscount: data.longStayDiscount ?? null,
      minimumStay: data.minimumStay ?? null,
      petPolicy: data.petPolicy ?? null,
      smokingPolicy: data.smokingPolicy ?? null,
      cancellationPolicy: data.cancellationPolicy ?? null,
      utilitiesIncluded: data.utilitiesIncluded ?? [],
      additionalNotes: data.additionalNotes ?? null,
      availableFrom: data.availableFrom ?? null,
      videoTourUrl: data.videoTourUrl ?? null,
    };
  }

  async list(): Promise<Apartment[]> {
    const snap = await this.db().collection(COLLECTION).get();
    return snap.docs.map((doc) => this.toApartment(doc.id, doc.data()));
  }

  async findOne(id: string): Promise<Apartment> {
    const doc = await this.db().collection(COLLECTION).doc(id).get();
    if (!doc.exists) throw new NotFoundException('Apartment not found');
    return this.toApartment(doc.id, doc.data() as RawApartmentData);
  }

  // Listings created before `listingVisibility` existed have it unset —
  // treat that the same as "Public" so nothing already live disappears.
  private isPubliclyVisible(apartment: Apartment): boolean {
    return (
      !apartment.listingVisibility ||
      apartment.listingVisibility === 'Public — visible on website'
    );
  }

  async listPublic(): Promise<Apartment[]> {
    const all = await this.list();
    return all.filter((a) => this.isPubliclyVisible(a));
  }

  async findOnePublic(id: string): Promise<Apartment> {
    const apartment = await this.findOne(id);
    if (!this.isPubliclyVisible(apartment)) {
      throw new NotFoundException('Apartment not found');
    }
    return apartment;
  }

  async create(dto: CreateApartmentDto): Promise<Apartment> {
    const ref = await this.db()
      .collection(COLLECTION)
      .add({
        ...dto,
        tenant: dto.tenant ?? null,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    return this.findOne(ref.id);
  }

  async update(id: string, dto: UpdateApartmentDto): Promise<Apartment> {
    const ref = this.db().collection(COLLECTION).doc(id);
    const doc = await ref.get();
    if (!doc.exists) throw new NotFoundException('Apartment not found');
    await ref.update({
      ...dto,
      updatedAt: FieldValue.serverTimestamp(),
    });
    return this.findOne(id);
  }

  async remove(id: string): Promise<{ id: string }> {
    const ref = this.db().collection(COLLECTION).doc(id);
    const doc = await ref.get();
    if (!doc.exists) throw new NotFoundException('Apartment not found');
    await ref.delete();
    return { id };
  }
}
