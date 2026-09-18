import {
  Inject,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { FieldValue, Firestore } from 'firebase-admin/firestore';
import { FIRESTORE } from '../firebase/firebase.module';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { PaymentStatus, TenantStatus } from './dto/create-tenant.dto';

export interface Tenant {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  apartmentId: string | null;
  apartmentName: string | null;
  leaseStart: string | null;
  leaseEnd: string | null;
  paymentStatus: PaymentStatus;
  status: TenantStatus;
  notes: string | null;
}

interface RawTenantData {
  name?: string;
  email?: string | null;
  phone?: string | null;
  apartmentId?: string | null;
  apartmentName?: string | null;
  leaseStart?: string | null;
  leaseEnd?: string | null;
  paymentStatus?: PaymentStatus;
  status?: TenantStatus;
  notes?: string | null;
}

const COLLECTION = 'tenants';

@Injectable()
export class TenantsService {
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

  private toTenant(id: string, data: RawTenantData): Tenant {
    return {
      id,
      name: data.name ?? '',
      email: data.email ?? null,
      phone: data.phone ?? null,
      apartmentId: data.apartmentId ?? null,
      apartmentName: data.apartmentName ?? null,
      leaseStart: data.leaseStart ?? null,
      leaseEnd: data.leaseEnd ?? null,
      paymentStatus: data.paymentStatus ?? 'Due',
      status: data.status ?? 'Active',
      notes: data.notes ?? null,
    };
  }

  async list(): Promise<Tenant[]> {
    const snap = await this.db().collection(COLLECTION).get();
    return snap.docs.map((doc) => this.toTenant(doc.id, doc.data()));
  }

  async findOne(id: string): Promise<Tenant> {
    const doc = await this.db().collection(COLLECTION).doc(id).get();
    if (!doc.exists) throw new NotFoundException('Tenant not found');
    return this.toTenant(doc.id, doc.data() as RawTenantData);
  }

  async create(dto: CreateTenantDto): Promise<Tenant> {
    const ref = await this.db()
      .collection(COLLECTION)
      .add({
        ...dto,
        paymentStatus: dto.paymentStatus ?? 'Due',
        status: dto.status ?? 'Active',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    return this.findOne(ref.id);
  }

  async update(id: string, dto: UpdateTenantDto): Promise<Tenant> {
    const ref = this.db().collection(COLLECTION).doc(id);
    const doc = await ref.get();
    if (!doc.exists) throw new NotFoundException('Tenant not found');
    await ref.update({ ...dto, updatedAt: FieldValue.serverTimestamp() });
    return this.findOne(id);
  }

  async remove(id: string): Promise<{ id: string }> {
    const ref = this.db().collection(COLLECTION).doc(id);
    const doc = await ref.get();
    if (!doc.exists) throw new NotFoundException('Tenant not found');
    await ref.delete();
    return { id };
  }
}
