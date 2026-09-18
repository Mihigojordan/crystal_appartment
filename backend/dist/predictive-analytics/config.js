"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PORT_THRESHOLDS = exports.STORAGE_THRESHOLDS = exports.SERVER_THRESHOLDS = exports.DEFAULT_STATUS_RISK = exports.STATUS_RISK = exports.FORECAST_HORIZON_DAYS = exports.MIN_SNAPSHOTS_FOR_TREND = exports.MAX_AGE_YEARS = exports.RISK_BANDS = void 0;
exports.RISK_BANDS = { critical: 70, warning: 40 };
exports.MAX_AGE_YEARS = 8;
exports.MIN_SNAPSHOTS_FOR_TREND = 3;
exports.FORECAST_HORIZON_DAYS = 365;
exports.STATUS_RISK = {
    Critical: 100,
    Offline: 85,
    Warning: 55,
    Maintenance: 35,
    Online: 10,
};
exports.DEFAULT_STATUS_RISK = 40;
exports.SERVER_THRESHOLDS = {
    cpuCriticalPct: 90,
    ramCriticalPct: 92,
    diskCriticalPct: 90,
};
exports.STORAGE_THRESHOLDS = {
    capacityCriticalPct: 100,
    latencyCriticalMs: 15,
};
exports.PORT_THRESHOLDS = {
    portUtilCriticalPct: 100,
};
//# sourceMappingURL=config.js.map