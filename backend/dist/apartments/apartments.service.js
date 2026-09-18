"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApartmentsService = void 0;
const common_1 = require("@nestjs/common");
const firestore_1 = require("firebase-admin/firestore");
const firebase_module_1 = require("../firebase/firebase.module");
const COLLECTION = 'apartments';
let ApartmentsService = class ApartmentsService {
    firestore;
    constructor(firestore) {
        this.firestore = firestore;
    }
    db() {
        if (!this.firestore) {
            throw new common_1.ServiceUnavailableException('Firebase is not configured — check backend/.env');
        }
        return this.firestore;
    }
    toApartment(id, data) {
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
    async list() {
        const snap = await this.db().collection(COLLECTION).get();
        return snap.docs.map((doc) => this.toApartment(doc.id, doc.data()));
    }
    async findOne(id) {
        const doc = await this.db().collection(COLLECTION).doc(id).get();
        if (!doc.exists)
            throw new common_1.NotFoundException('Apartment not found');
        return this.toApartment(doc.id, doc.data());
    }
    isPubliclyVisible(apartment) {
        return (!apartment.listingVisibility ||
            apartment.listingVisibility === 'Public — visible on website');
    }
    async listPublic() {
        const all = await this.list();
        return all.filter((a) => this.isPubliclyVisible(a));
    }
    async findOnePublic(id) {
        const apartment = await this.findOne(id);
        if (!this.isPubliclyVisible(apartment)) {
            throw new common_1.NotFoundException('Apartment not found');
        }
        return apartment;
    }
    async create(dto) {
        const ref = await this.db()
            .collection(COLLECTION)
            .add({
            ...dto,
            tenant: dto.tenant ?? null,
            createdAt: firestore_1.FieldValue.serverTimestamp(),
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
        });
        return this.findOne(ref.id);
    }
    async update(id, dto) {
        const ref = this.db().collection(COLLECTION).doc(id);
        const doc = await ref.get();
        if (!doc.exists)
            throw new common_1.NotFoundException('Apartment not found');
        await ref.update({
            ...dto,
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
        });
        return this.findOne(id);
    }
    async remove(id) {
        const ref = this.db().collection(COLLECTION).doc(id);
        const doc = await ref.get();
        if (!doc.exists)
            throw new common_1.NotFoundException('Apartment not found');
        await ref.delete();
        return { id };
    }
};
exports.ApartmentsService = ApartmentsService;
exports.ApartmentsService = ApartmentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(firebase_module_1.FIRESTORE)),
    __metadata("design:paramtypes", [Object])
], ApartmentsService);
//# sourceMappingURL=apartments.service.js.map