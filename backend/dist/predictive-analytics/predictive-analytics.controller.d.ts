import { PredictiveAnalyticsService } from './predictive-analytics.service';
export declare class PredictiveAnalyticsController {
    private readonly predictive;
    constructor(predictive: PredictiveAnalyticsService);
    getServers(): Promise<import("./predictive-analytics.service").ServerPrediction[]>;
    getStorage(): Promise<import("./predictive-analytics.service").StoragePrediction[]>;
    getSwitches(): Promise<import("./predictive-analytics.service").SwitchPrediction[]>;
}
