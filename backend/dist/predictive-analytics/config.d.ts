export declare const RISK_BANDS: {
    critical: number;
    warning: number;
};
export declare const MAX_AGE_YEARS = 8;
export declare const MIN_SNAPSHOTS_FOR_TREND = 3;
export declare const FORECAST_HORIZON_DAYS = 365;
export declare const STATUS_RISK: Record<string, number>;
export declare const DEFAULT_STATUS_RISK = 40;
export declare const SERVER_THRESHOLDS: {
    cpuCriticalPct: number;
    ramCriticalPct: number;
    diskCriticalPct: number;
};
export declare const STORAGE_THRESHOLDS: {
    capacityCriticalPct: number;
    latencyCriticalMs: number;
};
export declare const PORT_THRESHOLDS: {
    portUtilCriticalPct: number;
};
