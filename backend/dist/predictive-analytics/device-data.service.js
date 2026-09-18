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
exports.DeviceDataService = void 0;
const common_1 = require("@nestjs/common");
const firebase_module_1 = require("../firebase/firebase.module");
function toDate(ts) {
    const anyTs = ts;
    return anyTs?.toDate ? anyTs.toDate() : null;
}
let DeviceDataService = class DeviceDataService {
    firestore;
    constructor(firestore) {
        this.firestore = firestore;
    }
    db() {
        if (!this.firestore) {
            throw new common_1.ServiceUnavailableException('Firebase is not configured — add a real FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY to backend/.env to enable predictive analytics.');
        }
        return this.firestore;
    }
    async getServers() {
        const db = this.db();
        const snap = await db.collection('servers').get();
        return Promise.all(snap.docs.map(async (doc) => {
            const data = doc.data();
            const histSnap = await doc.ref
                .collection('perfSnapshots')
                .orderBy('createdAt', 'asc')
                .get();
            const cpuHistory = [];
            const ramHistory = [];
            const diskHistory = [];
            for (const h of histSnap.docs) {
                const hd = h.data();
                const timestamp = toDate(hd.createdAt);
                if (!timestamp)
                    continue;
                if (hd.cpuPct != null)
                    cpuHistory.push({ timestamp, value: Number(hd.cpuPct) });
                if (hd.ramPct != null)
                    ramHistory.push({ timestamp, value: Number(hd.ramPct) });
                if (hd.diskPct != null)
                    diskHistory.push({ timestamp, value: Number(hd.diskPct) });
            }
            return {
                id: doc.id,
                name: data.name ?? doc.id,
                role: data.role ?? data.type ?? null,
                location: data.location ?? null,
                status: data.status ?? 'Offline',
                createdAt: toDate(data.createdAt),
                cpuCapacity: Number(data.cpuCapacity) || 0,
                cpuUsed: Number(data.cpuUsed) || 0,
                ramUsedGb: Number(data.ramUsedGb) || 0,
                ramTotalGb: Number(data.ramTotalGb) || 0,
                storageUsedGb: Number(data.storageUsedGb) || 0,
                storageTotalGb: Number(data.storageTotalGb) || 0,
                cpuHistory,
                ramHistory,
                diskHistory,
            };
        }));
    }
    async getStorage() {
        const db = this.db();
        const snap = await db.collection('storageDevices').get();
        return Promise.all(snap.docs.map(async (doc) => {
            const data = doc.data();
            const histSnap = await doc.ref
                .collection('perfSnapshots')
                .orderBy('createdAt', 'asc')
                .get();
            const capacityHistory = [];
            const latencyHistory = [];
            for (const h of histSnap.docs) {
                const hd = h.data();
                const timestamp = toDate(hd.createdAt);
                if (!timestamp)
                    continue;
                if (hd.usedPct != null)
                    capacityHistory.push({ timestamp, value: Number(hd.usedPct) });
                if (hd.latencyMs != null)
                    latencyHistory.push({ timestamp, value: Number(hd.latencyMs) });
            }
            return {
                id: doc.id,
                name: data.name ?? doc.id,
                type: data.type ?? null,
                location: data.location ?? null,
                status: data.status ?? 'Offline',
                createdAt: toDate(data.createdAt),
                capacityUsedGb: Number(data.capacityUsedGb) || 0,
                capacityTotalGb: Number(data.capacityTotalGb) || 0,
                latencyMs: Number(data.latencyMs) || 0,
                iops: Number(data.iops) || 0,
                throughputMbps: Number(data.throughputMbps) || 0,
                capacityHistory,
                latencyHistory,
            };
        }));
    }
    async getSwitches() {
        const db = this.db();
        const snap = await db.collection('networkDevices').get();
        return Promise.all(snap.docs.map(async (doc) => {
            const data = doc.data();
            const portsSnap = await doc.ref.collection('ports').get();
            const portsUp = portsSnap.docs.filter((p) => p.data().status === 'Up').length;
            const histSnap = await doc.ref
                .collection('perfSnapshots')
                .orderBy('createdAt', 'asc')
                .get();
            const portUtilizationHistory = [];
            for (const h of histSnap.docs) {
                const hd = h.data();
                const timestamp = toDate(hd.createdAt);
                if (!timestamp || hd.usedPct == null)
                    continue;
                portUtilizationHistory.push({
                    timestamp,
                    value: Number(hd.usedPct),
                });
            }
            return {
                id: doc.id,
                name: data.name ?? doc.id,
                model: data.model ?? data.manufacturer ?? null,
                location: data.location ?? null,
                status: data.status ?? 'Offline',
                createdAt: toDate(data.createdAt),
                portCount: Number(data.portCount) || 0,
                portsUp,
                portUtilizationHistory,
            };
        }));
    }
};
exports.DeviceDataService = DeviceDataService;
exports.DeviceDataService = DeviceDataService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(firebase_module_1.FIRESTORE)),
    __metadata("design:paramtypes", [Object])
], DeviceDataService);
//# sourceMappingURL=device-data.service.js.map