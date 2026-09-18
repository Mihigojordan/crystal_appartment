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
exports.MessagesService = void 0;
const common_1 = require("@nestjs/common");
const firestore_1 = require("firebase-admin/firestore");
const firebase_module_1 = require("../firebase/firebase.module");
const COLLECTION = 'messages';
let MessagesService = class MessagesService {
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
    toMessage(id, data) {
        return {
            id,
            name: data.name ?? '',
            email: data.email ?? '',
            phone: data.phone ?? null,
            message: data.message ?? '',
            status: data.status ?? 'New',
            createdAt: data.createdAt?.toDate().toISOString() ?? null,
        };
    }
    async create(dto) {
        const ref = await this.db()
            .collection(COLLECTION)
            .add({
            ...dto,
            phone: dto.phone ?? null,
            status: 'New',
            createdAt: firestore_1.FieldValue.serverTimestamp(),
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
        });
        const doc = await ref.get();
        return this.toMessage(doc.id, doc.data());
    }
    async list() {
        const snap = await this.db()
            .collection(COLLECTION)
            .orderBy('createdAt', 'desc')
            .get();
        return snap.docs.map((doc) => this.toMessage(doc.id, doc.data()));
    }
    async updateStatus(id, status) {
        const ref = this.db().collection(COLLECTION).doc(id);
        const doc = await ref.get();
        if (!doc.exists)
            throw new common_1.NotFoundException('Message not found');
        await ref.update({ status, updatedAt: firestore_1.FieldValue.serverTimestamp() });
        const updated = await ref.get();
        return this.toMessage(updated.id, updated.data());
    }
    async remove(id) {
        const ref = this.db().collection(COLLECTION).doc(id);
        const doc = await ref.get();
        if (!doc.exists)
            throw new common_1.NotFoundException('Message not found');
        await ref.delete();
        return { id };
    }
};
exports.MessagesService = MessagesService;
exports.MessagesService = MessagesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(firebase_module_1.FIRESTORE)),
    __metadata("design:paramtypes", [Object])
], MessagesService);
//# sourceMappingURL=messages.service.js.map