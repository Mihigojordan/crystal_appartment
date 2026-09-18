"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllExceptionsFilter = void 0;
const common_1 = require("@nestjs/common");
const logs_service_1 = require("./logs.service");
let AllExceptionsFilter = class AllExceptionsFilter {
    logsService;
    logger = new common_1.Logger('AllExceptionsFilter');
    constructor(logsService) {
        this.logsService = logsService;
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const res = ctx.getResponse();
        const req = ctx.getRequest();
        const isHttp = exception instanceof common_1.HttpException;
        const status = isHttp
            ? exception.getStatus()
            : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        const body = isHttp
            ? exception.getResponse()
            : { statusCode: status, message: 'Internal server error' };
        if (status >= 500) {
            const message = exception instanceof Error ? exception.message : 'Unknown error';
            const stack = exception instanceof Error ? exception.stack : undefined;
            this.logger.error(`${req.method} ${req.url} → ${message}`, stack);
            this.logsService
                .record({
                activity: `${req.method} ${req.url}: ${message}`,
                type: 'error',
                source: 'backend',
            })
                .catch((err) => this.logger.warn(`Failed to persist error log: ${err.message}`));
        }
        res.status(status).json(body);
    }
};
exports.AllExceptionsFilter = AllExceptionsFilter;
exports.AllExceptionsFilter = AllExceptionsFilter = __decorate([
    (0, common_1.Catch)(),
    __metadata("design:paramtypes", [logs_service_1.LogsService])
], AllExceptionsFilter);
//# sourceMappingURL=all-exceptions.filter.js.map