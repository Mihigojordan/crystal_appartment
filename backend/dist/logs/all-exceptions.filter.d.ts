import { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { LogsService } from './logs.service';
export declare class AllExceptionsFilter implements ExceptionFilter {
    private readonly logsService;
    private readonly logger;
    constructor(logsService: LogsService);
    catch(exception: unknown, host: ArgumentsHost): void;
}
