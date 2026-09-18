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
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const firebase_module_1 = require("../firebase/firebase.module");
const MAX_AGE_YEARS = 8;
const WARRANTY_RISK = {
    expired: 100,
    expiring: 60,
    unknown: 40,
    active: 10,
};
function ageYears(purchaseDate) {
    if (!purchaseDate)
        return null;
    const ms = Date.now() - new Date(`${purchaseDate}T00:00:00`).getTime();
    return ms > 0 ? ms / (365.25 * 86400000) : null;
}
function warrantyState(warrantyExpiry) {
    if (!warrantyExpiry)
        return 'unknown';
    const days = Math.round((new Date(`${warrantyExpiry}T00:00:00`).getTime() - Date.now()) / 86400000);
    if (days < 0)
        return 'expired';
    if (days <= 90)
        return 'expiring';
    return 'active';
}
function daysUntil(dateStr) {
    if (!dateStr)
        return null;
    return Math.round((new Date(`${dateStr}T00:00:00`).getTime() - Date.now()) / 86400000);
}
let AnalyticsService = class AnalyticsService {
    firestore;
    constructor(firestore) {
        this.firestore = firestore;
    }
    async getEquipmentRisk() {
        if (!this.firestore) {
            throw new common_1.ServiceUnavailableException('Firebase is not configured — add a real FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY to backend/.env.');
        }
        const snap = await this.firestore.collection('equipment').get();
        const items = [];
        for (const doc of snap.docs) {
            const data = doc.data();
            if (data.status === 'Retired')
                continue;
            const age = ageYears(data.purchaseDate);
            const warranty = warrantyState(data.warrantyExpiry);
            const ageComponent = age == null ? 40 : Math.min(100, (age / MAX_AGE_YEARS) * 100);
            const warrantyComponent = WARRANTY_RISK[warranty];
            const riskScore = Math.round(ageComponent * 0.6 + warrantyComponent * 0.4);
            const healthScore = 100 - riskScore;
            const riskBand = riskScore >= 70 ? 'critical' : riskScore >= 40 ? 'warning' : 'healthy';
            items.push({
                id: doc.id,
                name: data.name ?? 'Unnamed',
                category: data.category ?? null,
                status: data.status ?? null,
                ageYears: age == null ? null : Math.round(age * 10) / 10,
                purchaseDate: data.purchaseDate ?? null,
                warrantyExpiry: data.warrantyExpiry ?? null,
                warrantyState: warranty,
                daysUntilWarrantyExpiry: daysUntil(data.warrantyExpiry),
                cost: data.cost != null ? Number(data.cost) : null,
                riskScore,
                healthScore,
                riskBand,
            });
        }
        items.sort((a, b) => b.riskScore - a.riskScore);
        const activeCount = items.length;
        const avgRiskScore = activeCount
            ? Math.round(items.reduce((s, i) => s + i.riskScore, 0) / activeCount)
            : null;
        return {
            generatedAt: new Date().toISOString(),
            fleet: {
                activeCount,
                avgRiskScore,
                avgHealthScore: avgRiskScore == null ? null : 100 - avgRiskScore,
                criticalCount: items.filter((i) => i.riskBand === 'critical').length,
                warningCount: items.filter((i) => i.riskBand === 'warning').length,
                healthyCount: items.filter((i) => i.riskBand === 'healthy').length,
            },
            items,
        };
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(firebase_module_1.FIRESTORE)),
    __metadata("design:paramtypes", [Object])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map