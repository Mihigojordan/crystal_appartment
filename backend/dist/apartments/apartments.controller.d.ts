import { ApartmentsService } from './apartments.service';
import { CreateApartmentDto } from './dto/create-apartment.dto';
import { UpdateApartmentDto } from './dto/update-apartment.dto';
export declare class ApartmentsController {
    private readonly apartmentsService;
    constructor(apartmentsService: ApartmentsService);
    listPublic(): Promise<import("./apartments.service").Apartment[]>;
    findOnePublic(id: string): Promise<import("./apartments.service").Apartment>;
    list(): Promise<import("./apartments.service").Apartment[]>;
    findOne(id: string): Promise<import("./apartments.service").Apartment>;
    create(dto: CreateApartmentDto): Promise<import("./apartments.service").Apartment>;
    update(id: string, dto: UpdateApartmentDto): Promise<import("./apartments.service").Apartment>;
    remove(id: string): Promise<{
        id: string;
    }>;
}
