import { DeviceDataService } from './device-data.service';
type RiskBand = 'critical' | 'warning' | 'healthy';
interface MetricResult {
    currentPct: number;
    trendPctPerDay: number;
    confidence: number | null;
    daysToCritical: number | null;
    criticalThreshold: number;
    hasHistory: boolean;
    history: number[];
    historyDates: string[];
}
export interface ServerPrediction {
    id: string;
    name: string;
    role: string | null;
    location: string | null;
    status: string;
    ageYears: number | null;
    cpu: MetricResult;
    ram: MetricResult;
    disk: MetricResult;
    riskScore: number;
    riskBand: RiskBand;
    recommendation: string;
}
export interface StoragePrediction {
    id: string;
    name: string;
    type: string | null;
    location: string | null;
    status: string;
    ageYears: number | null;
    capacity: MetricResult;
    latency: MetricResult;
    riskScore: number;
    riskBand: RiskBand;
    recommendation: string;
}
export interface SwitchPrediction {
    id: string;
    name: string;
    model: string | null;
    location: string | null;
    status: string;
    ageYears: number | null;
    portUtilization: MetricResult | null;
    riskScore: number;
    riskBand: RiskBand;
    recommendation: string;
}
export declare class PredictiveAnalyticsService {
    private readonly deviceData;
    constructor(deviceData: DeviceDataService);
    predictServers(): Promise<ServerPrediction[]>;
    predictStorage(): Promise<StoragePrediction[]>;
    predictSwitches(): Promise<SwitchPrediction[]>;
}
export {};
