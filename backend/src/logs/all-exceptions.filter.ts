import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { LogsService } from './logs.service';

// Logs every 5xx to Firestore activityLogs (source: 'backend') so server
// crashes show up in the admin Logs page, then re-emits Nest's normal
// error response shape unchanged.
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('AllExceptionsFilter');

  constructor(private readonly logsService: LogsService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const isHttp = exception instanceof HttpException;
    const status = isHttp
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const body = isHttp
      ? exception.getResponse()
      : { statusCode: status, message: 'Internal server error' };

    if (status >= 500) {
      const message =
        exception instanceof Error ? exception.message : 'Unknown error';
      const stack = exception instanceof Error ? exception.stack : undefined;
      this.logger.error(`${req.method} ${req.url} → ${message}`, stack);
      this.logsService
        .record({
          activity: `${req.method} ${req.url}: ${message}`,
          type: 'error',
          source: 'backend',
        })
        .catch((err) =>
          this.logger.warn(`Failed to persist error log: ${err.message}`),
        );
    }

    res.status(status).json(body);
  }
}
