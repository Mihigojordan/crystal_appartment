import { Firestore } from 'firebase-admin/firestore';
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
export declare class TenantsService {
    private readonly firestore;
    constructor(firestore: Firestore | null);
    private db;
    private toTenant;
    list(): Promise<Tenant[]>;
    findOne(id: string): Promise<Tenant>;
    create(dto: CreateTenantDto): Promise<Tenant>;
    update(id: string, dto: UpdateTenantDto): Promise<Tenant>;
    remove(id: string): Promise<{
        id: string;
    }>;
}
