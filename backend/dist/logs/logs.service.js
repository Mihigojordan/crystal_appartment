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
exports.LogsService = void 0;
const common_1 = require("@nestjs/common");
const firestore_1 = require("firebase-admin/firestore");
const firebase_module_1 = require("../firebase/firebase.module");
const COLLECTION = 'activityLogs';
let LogsService = class LogsService {
    firestore;
    constructor(firestore) {
        this.firestore = firestore;
    }
    async list() {
        if (!this.firestore) {
            throw new common_1.ServiceUnavailableException('Firebase is not configured — check backend/.env');
        }
        const snap = await this.firestore
            .collection(COLLECTION)
            .orderBy('time', 'desc')
            .limit(100)
            .get();
        const entries = snap.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                activity: data.activity ?? '',
                type: data.type ?? '',
                source: data.source ?? '',
                time: data.time?.toDate().toISOString() ?? null,
            };
        });
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const stats = {
            eventsToday: entries.filter((e) => e.time && new Date(e.time) >= startOfToday).length,
            logins: entries.filter((e) => e.type === 'login').length,
            warnings: entries.filter((e) => e.type === 'warning').length,
            errors: entries.filter((e) => e.type === 'error').length,
        };
        return { stats, entries };
    }
    async record(activity) {
        if (!this.firestore)
            return;
        await this.firestore.collection(COLLECTION).add({
            ...activity,
            time: firestore_1.FieldValue.serverTimestamp(),
        });
    }
    async remove(id) {
        if (!this.firestore) {
            throw new common_1.ServiceUnavailableException('Firebase is not configured — check backend/.env');
        }
        const ref = this.firestore.collection(COLLECTION).doc(id);
        const doc = await ref.get();
        if (!doc.exists)
            throw new common_1.NotFoundException('Log entry not found');
        await ref.delete();
        return { id };
    }
    async recordClientError(dto) {
        if (!this.firestore)
            return;
        await this.firestore.collection(COLLECTION).add({
            activity: dto.message,
            type: dto.level ?? 'error',
            source: 'frontend',
            url: dto.url ?? null,
            userAgent: dto.userAgent ?? null,
            stack: dto.stack ?? null,
            time: firestore_1.FieldValue.serverTimestamp(),
        });
    }
};
exports.LogsService = LogsService;
exports.LogsService = LogsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(firebase_module_1.FIRESTORE)),
    __metadata("design:paramtypes", [Object])
], LogsService);
//# sourceMappingURL=logs.service.js.map