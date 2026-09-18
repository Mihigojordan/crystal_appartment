import { AnalyticsService } from './analytics.service';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    getEquipmentRisk(): Promise<import("./analytics.service").EquipmentRiskReport>;
}
