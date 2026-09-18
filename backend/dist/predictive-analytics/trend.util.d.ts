export interface TrendResult {
    slopePerDay: number;
    intercept: number;
    current: number;
    r2: number;
}
export interface TimedSample {
    timestamp: Date;
    value: number;
}
export declare function linearTrendFromSamples(samples: TimedSample[]): TrendResult;
export declare function daysToThreshold(current: number, slopePerDay: number, threshold: number): number | null;
export declare function ageYears(createdAt: Date | null): number | null;
export declare function clamp(v: number, lo: number, hi: number): number;
export declare function pct(used: number | undefined, total: number | undefined): number;
export interface ScoreComponent {
    value: number;
    weight: number;
    available?: boolean;
}
export declare function weightedScore(components: ScoreComponent[]): number;
