import { ClientErrorDto } from './dto/client-error.dto';
import { LogsService } from './logs.service';
export declare class LogsController {
    private readonly logsService;
    constructor(logsService: LogsService);
    list(): Promise<{
        stats: {
            eventsToday: number;
            logins: number;
            warnings: number;
            errors: number;
        };
        entries: import("./logs.service").ActivityLogEntry[];
    }>;
    remove(id: string): Promise<{
        id: string;
    }>;
    clientError(dto: ClientErrorDto): Promise<{
        received: boolean;
    }>;
}
