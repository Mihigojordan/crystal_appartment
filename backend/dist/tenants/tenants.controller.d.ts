import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
export declare class TenantsController {
    private readonly tenantsService;
    constructor(tenantsService: TenantsService);
    list(): Promise<import("./tenants.service").Tenant[]>;
    findOne(id: string): Promise<import("./tenants.service").Tenant>;
    create(dto: CreateTenantDto): Promise<import("./tenants.service").Tenant>;
    update(id: string, dto: UpdateTenantDto): Promise<import("./tenants.service").Tenant>;
    remove(id: string): Promise<{
        id: string;
    }>;
}
