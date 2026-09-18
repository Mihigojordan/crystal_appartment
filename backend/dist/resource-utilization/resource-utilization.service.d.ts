import { DeviceDataService } from '../predictive-analytics/device-data.service';
export interface ServerUtilizationDevice {
    id: string;
    name: string;
    role: string | null;
    location: string | null;
    status: string;
    cpuPct: number;
    ramUsedGb: number;
    ramTotalGb: number;
    ramPct: number;
    diskUsedGb: number;
    diskTotalGb: number;
    diskPct: number;
}
export interface StorageUtilizationDevice {
    id: string;
    name: string;
    type: string | null;
    location: string | null;
    status: string;
    capacityUsedGb: number;
    capacityTotalGb: number;
    capacityPct: number;
    latencyMs: number;
    iops: number;
    throughputMbps: number;
}
export interface SwitchUtilizationDevice {
    id: string;
    name: string;
    model: string | null;
    location: string | null;
    status: string;
    portCount: number;
    portsUp: number;
    portPct: number | null;
}
export interface ResourceUtilizationSummary {
    generatedAt: string;
    servers: {
        devices: ServerUtilizationDevice[];
        fleet: {
            count: number;
            avgCpuPct: number | null;
            totalRamUsedGb: number;
            totalRamTotalGb: number;
            ramPct: number;
            totalDiskUsedGb: number;
            totalDiskTotalGb: number;
            diskPct: number;
        };
    };
    storage: {
        devices: StorageUtilizationDevice[];
        fleet: {
            count: number;
            totalCapacityUsedGb: number;
            totalCapacityTotalGb: number;
            capacityPct: number;
            avgLatencyMs: number | null;
            totalIops: number;
            totalThroughputMbps: number;
        };
    };
    switches: {
        devices: SwitchUtilizationDevice[];
        fleet: {
            count: number;
            totalPorts: number;
            totalPortsUp: number;
            portPct: number | null;
            statusCounts: Record<string, number>;
        };
    };
}
export declare class ResourceUtilizationService {
    private readonly deviceData;
    constructor(deviceData: DeviceDataService);
    getSummary(): Promise<ResourceUtilizationSummary>;
}
