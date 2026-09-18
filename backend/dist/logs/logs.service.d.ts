import { Firestore } from 'firebase-admin/firestore';
import { ClientErrorDto } from './dto/client-error.dto';
export interface ActivityLogEntry {
    id: string;
    activity: string;
    type: string;
    source: string;
    time: string | null;
}
export declare class LogsService {
    private readonly firestore;
    constructor(firestore: Firestore | null);
    list(): Promise<{
        stats: {
            eventsToday: number;
            logins: number;
            warnings: number;
            errors: number;
        };
        entries: ActivityLogEntry[];
    }>;
    record(activity: {
        activity: string;
        type: string;
        source: string;
    }): Promise<void>;
    remove(id: string): Promise<{
        id: string;
    }>;
    recordClientError(dto: ClientErrorDto): Promise<void>;
}
