import { Firestore } from 'firebase-admin/firestore';
import { TimedSample } from './trend.util';
export interface ServerDoc {
    id: string;
    name: string;
    role: string | null;
    location: string | null;
    status: string;
    createdAt: Date | null;
    cpuCapacity: number;
    cpuUsed: number;
    ramUsedGb: number;
    ramTotalGb: number;
    storageUsedGb: number;
    storageTotalGb: number;
    cpuHistory: TimedSample[];
    ramHistory: TimedSample[];
    diskHistory: TimedSample[];
}
export interface StorageDoc {
    id: string;
    name: string;
    type: string | null;
    location: string | null;
    status: string;
    createdAt: Date | null;
    capacityUsedGb: number;
    capacityTotalGb: number;
    latencyMs: number;
    iops: number;
    throughputMbps: number;
    capacityHistory: TimedSample[];
    latencyHistory: TimedSample[];
}
export interface SwitchDoc {
    id: string;
    name: string;
    model: string | null;
    location: string | null;
    status: string;
    createdAt: Date | null;
    portCount: number;
    portsUp: number;
    portUtilizationHistory: TimedSample[];
}
export declare class DeviceDataService {
    private readonly firestore;
    constructor(firestore: Firestore | null);
    private db;
    getServers(): Promise<ServerDoc[]>;
    getStorage(): Promise<StorageDoc[]>;
    getSwitches(): Promise<SwitchDoc[]>;
}
