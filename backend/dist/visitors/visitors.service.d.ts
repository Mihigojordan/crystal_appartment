import { ConfigService } from '@nestjs/config';
export interface BreakdownRow {
    id: string;
    label: string;
    value: number;
}
export interface VisitorsReport {
    stats: {
        totalVisitors: number | null;
        sessions: number | null;
        bounceRate: number | null;
        avgSessionDuration: number | null;
        bookingConversion: number | null;
        activeUsersNow: number | null;
    };
    topPages: BreakdownRow[];
    sources: BreakdownRow[];
    devices: BreakdownRow[];
}
export declare class VisitorsService {
    private readonly config;
    private readonly client;
    private readonly propertyId;
    constructor(config: ConfigService);
    list(): Promise<VisitorsReport>;
}
