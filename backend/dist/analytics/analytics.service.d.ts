import { Firestore } from 'firebase-admin/firestore';
type WarrantyState = 'active' | 'expiring' | 'expired' | 'unknown';
export interface EquipmentRisk {
    id: string;
    name: string;
    category: string | null;
    status: string | null;
    ageYears: number | null;
    purchaseDate: string | null;
    warrantyExpiry: string | null;
    warrantyState: WarrantyState;
    daysUntilWarrantyExpiry: number | null;
    cost: number | null;
    riskScore: number;
    healthScore: number;
    riskBand: 'critical' | 'warning' | 'healthy';
}
export interface EquipmentRiskReport {
    generatedAt: string;
    fleet: {
        activeCount: number;
        avgRiskScore: number | null;
        avgHealthScore: number | null;
        criticalCount: number;
        warningCount: number;
        healthyCount: number;
    };
    items: EquipmentRisk[];
}
export declare class AnalyticsService {
    private readonly firestore;
    constructor(firestore: Firestore | null);
    getEquipmentRisk(): Promise<EquipmentRiskReport>;
}
export {};
