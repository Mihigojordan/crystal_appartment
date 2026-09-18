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
exports.PredictiveAnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const device_data_service_1 = require("./device-data.service");
const config_1 = require("./config");
const trend_util_1 = require("./trend.util");
function bandFor(score) {
    if (score >= config_1.RISK_BANDS.critical)
        return 'critical';
    if (score >= config_1.RISK_BANDS.warning)
        return 'warning';
    return 'healthy';
}
function statusRisk(status) {
    return config_1.STATUS_RISK[status] ?? config_1.DEFAULT_STATUS_RISK;
}
function ageComponentOf(age) {
    return age == null ? 40 : (0, trend_util_1.clamp)((age / config_1.MAX_AGE_YEARS) * 100, 0, 100);
}
function round3(v) {
    return Math.round(v * 1000) / 1000;
}
function buildMetric(current, history, threshold) {
    const hasHistory = history.length >= config_1.MIN_SNAPSHOTS_FOR_TREND;
    const sorted = [...history].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    const trend = hasHistory ? (0, trend_util_1.linearTrendFromSamples)(sorted) : null;
    return {
        currentPct: current,
        trendPctPerDay: trend ? round3(trend.slopePerDay) : 0,
        confidence: trend ? trend.r2 : null,
        daysToCritical: trend
            ? (0, trend_util_1.daysToThreshold)(current, trend.slopePerDay, threshold)
            : null,
        criticalThreshold: threshold,
        hasHistory,
        history: sorted.map((h) => h.value),
        historyDates: sorted.map((h) => h.timestamp.toISOString().slice(0, 10)),
    };
}
let PredictiveAnalyticsService = class PredictiveAnalyticsService {
    deviceData;
    constructor(deviceData) {
        this.deviceData = deviceData;
    }
    async predictServers() {
        const servers = await this.deviceData.getServers();
        return servers
            .map((s) => {
            const age = (0, trend_util_1.ageYears)(s.createdAt);
            const ageComponent = ageComponentOf(age);
            const statusComponent = statusRisk(s.status);
            const cpu = buildMetric((0, trend_util_1.pct)(s.cpuUsed, s.cpuCapacity), s.cpuHistory, config_1.SERVER_THRESHOLDS.cpuCriticalPct);
            const ram = buildMetric((0, trend_util_1.pct)(s.ramUsedGb, s.ramTotalGb), s.ramHistory, config_1.SERVER_THRESHOLDS.ramCriticalPct);
            const disk = buildMetric((0, trend_util_1.pct)(s.storageUsedGb, s.storageTotalGb), s.diskHistory, config_1.SERVER_THRESHOLDS.diskCriticalPct);
            const utilNowComponent = Math.max((0, trend_util_1.clamp)((cpu.currentPct / config_1.SERVER_THRESHOLDS.cpuCriticalPct) * 100, 0, 100), (0, trend_util_1.clamp)((ram.currentPct / config_1.SERVER_THRESHOLDS.ramCriticalPct) * 100, 0, 100));
            const diskNowComponent = (0, trend_util_1.clamp)((disk.currentPct / config_1.SERVER_THRESHOLDS.diskCriticalPct) * 100, 0, 100);
            const hasAnyHistory = cpu.hasHistory || ram.hasHistory;
            const utilTrendComponent = hasAnyHistory
                ? (0, trend_util_1.clamp)(Math.max(cpu.trendPctPerDay, ram.trendPctPerDay) * 20, 0, 100)
                : 0;
            const riskScore = (0, trend_util_1.weightedScore)([
                { value: ageComponent, weight: 0.15 },
                { value: statusComponent, weight: 0.25 },
                { value: utilNowComponent, weight: 0.3 },
                { value: diskNowComponent, weight: 0.1 },
                { value: utilTrendComponent, weight: 0.2, available: hasAnyHistory },
            ]);
            const riskBand = bandFor(riskScore);
            const recommendation = buildServerRecommendation({
                riskBand,
                status: s.status,
                cpuDaysToCritical: cpu.daysToCritical,
                ramDaysToCritical: ram.daysToCritical,
                hasAnyHistory,
            });
            return {
                id: s.id,
                name: s.name,
                role: s.role,
                location: s.location,
                status: s.status,
                ageYears: age == null ? null : Math.round(age * 10) / 10,
                cpu,
                ram,
                disk,
                riskScore,
                riskBand,
                recommendation,
            };
        })
            .sort((a, b) => b.riskScore - a.riskScore);
    }
    async predictStorage() {
        const storage = await this.deviceData.getStorage();
        return storage
            .map((s) => {
            const age = (0, trend_util_1.ageYears)(s.createdAt);
            const ageComponent = ageComponentOf(age);
            const statusComponent = statusRisk(s.status);
            const capacity = buildMetric((0, trend_util_1.pct)(s.capacityUsedGb, s.capacityTotalGb), s.capacityHistory, config_1.STORAGE_THRESHOLDS.capacityCriticalPct);
            const latency = buildMetric(s.latencyMs, s.latencyHistory, config_1.STORAGE_THRESHOLDS.latencyCriticalMs);
            const capNowComponent = (0, trend_util_1.clamp)((capacity.currentPct / config_1.STORAGE_THRESHOLDS.capacityCriticalPct) * 100, 0, 100);
            const latNowComponent = (0, trend_util_1.clamp)((latency.currentPct / config_1.STORAGE_THRESHOLDS.latencyCriticalMs) * 100, 0, 100);
            const riskScore = (0, trend_util_1.weightedScore)([
                { value: ageComponent, weight: 0.15 },
                { value: statusComponent, weight: 0.2 },
                { value: capNowComponent, weight: 0.35 },
                { value: latNowComponent, weight: 0.1 },
                {
                    value: (0, trend_util_1.clamp)(capacity.trendPctPerDay * 25, 0, 100),
                    weight: 0.15,
                    available: capacity.hasHistory,
                },
                {
                    value: (0, trend_util_1.clamp)(latency.trendPctPerDay * 10, 0, 100),
                    weight: 0.05,
                    available: latency.hasHistory,
                },
            ]);
            const riskBand = bandFor(riskScore);
            const recommendation = buildStorageRecommendation({
                riskBand,
                status: s.status,
                daysToFull: capacity.daysToCritical,
                latDaysToCritical: latency.daysToCritical,
                hasAnyHistory: capacity.hasHistory || latency.hasHistory,
            });
            return {
                id: s.id,
                name: s.name,
                type: s.type,
                location: s.location,
                status: s.status,
                ageYears: age == null ? null : Math.round(age * 10) / 10,
                capacity,
                latency,
                riskScore,
                riskBand,
                recommendation,
            };
        })
            .sort((a, b) => b.riskScore - a.riskScore);
    }
    async predictSwitches() {
        const switches = await this.deviceData.getSwitches();
        return switches
            .map((s) => {
            const age = (0, trend_util_1.ageYears)(s.createdAt);
            const ageComponent = ageComponentOf(age);
            const statusComponent = statusRisk(s.status);
            const hasPortCount = s.portCount > 0;
            const portUtilization = hasPortCount
                ? buildMetric((0, trend_util_1.pct)(s.portsUp, s.portCount), s.portUtilizationHistory, config_1.PORT_THRESHOLDS.portUtilCriticalPct)
                : null;
            const portNowComponent = portUtilization
                ? (0, trend_util_1.clamp)((portUtilization.currentPct /
                    config_1.PORT_THRESHOLDS.portUtilCriticalPct) *
                    100, 0, 100)
                : 0;
            const portTrendComponent = portUtilization?.hasHistory
                ? (0, trend_util_1.clamp)(portUtilization.trendPctPerDay * 25, 0, 100)
                : 0;
            const riskScore = (0, trend_util_1.weightedScore)([
                { value: ageComponent, weight: 0.25 },
                { value: statusComponent, weight: 0.35 },
                {
                    value: portNowComponent,
                    weight: 0.25,
                    available: !!portUtilization,
                },
                {
                    value: portTrendComponent,
                    weight: 0.15,
                    available: !!portUtilization?.hasHistory,
                },
            ]);
            const riskBand = bandFor(riskScore);
            const recommendation = buildSwitchRecommendation({
                riskBand,
                status: s.status,
                daysToPortExhaustion: portUtilization?.daysToCritical ?? null,
                hasPortCount,
            });
            return {
                id: s.id,
                name: s.name,
                model: s.model,
                location: s.location,
                status: s.status,
                ageYears: age == null ? null : Math.round(age * 10) / 10,
                portUtilization,
                riskScore,
                riskBand,
                recommendation,
            };
        })
            .sort((a, b) => b.riskScore - a.riskScore);
    }
};
exports.PredictiveAnalyticsService = PredictiveAnalyticsService;
exports.PredictiveAnalyticsService = PredictiveAnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [device_data_service_1.DeviceDataService])
], PredictiveAnalyticsService);
function buildServerRecommendation(args) {
    const { riskBand, status, cpuDaysToCritical, ramDaysToCritical, hasAnyHistory, } = args;
    if (status === 'Critical')
        return 'Reported status is Critical — investigate immediately.';
    if (cpuDaysToCritical === 0 || ramDaysToCritical === 0)
        return 'CPU or RAM is already at/above its critical threshold — plan workload migration or upgrade now.';
    if (cpuDaysToCritical != null && cpuDaysToCritical < 60)
        return `CPU utilization trending to saturation in ~${cpuDaysToCritical}d — plan workload migration or upgrade.`;
    if (ramDaysToCritical != null && ramDaysToCritical < 60)
        return `RAM utilization trending to saturation in ~${ramDaysToCritical}d — plan memory upgrade.`;
    if (status === 'Offline')
        return 'Reported status is Offline — verify connectivity and monitoring.';
    if (status === 'Warning')
        return 'Reported status is Warning — review recent alerts on this server.';
    if (!hasAnyHistory)
        return 'No trend yet — log a few performance snapshots on this server to unlock forecasting.';
    if (riskBand === 'healthy')
        return 'Stable — no action needed.';
    return 'Monitor — trending components are within tolerance but worth a periodic check.';
}
function buildStorageRecommendation(args) {
    const { riskBand, status, daysToFull, latDaysToCritical, hasAnyHistory } = args;
    if (status === 'Critical')
        return 'Reported status is Critical — investigate immediately.';
    if (daysToFull === 0)
        return 'Already at or above capacity — plan expansion or archival now.';
    if (daysToFull != null && daysToFull < 60)
        return `Projected to reach full capacity in ~${daysToFull}d — plan expansion or archival now.`;
    if (latDaysToCritical != null && latDaysToCritical < 60)
        return `Latency trending to critical in ~${latDaysToCritical}d — investigate I/O contention.`;
    if (status === 'Offline')
        return 'Reported status is Offline — verify connectivity and monitoring.';
    if (status === 'Warning')
        return 'Reported status is Warning — review recent alerts on this array.';
    if (!hasAnyHistory)
        return 'No trend yet — log a few performance snapshots on this array to unlock forecasting.';
    if (riskBand === 'healthy')
        return 'Stable — no action needed.';
    return 'Monitor — trending components are within tolerance but worth a periodic check.';
}
function buildSwitchRecommendation(args) {
    const { riskBand, status, daysToPortExhaustion, hasPortCount } = args;
    if (status === 'Critical')
        return 'Reported status is Critical — investigate immediately.';
    if (daysToPortExhaustion === 0)
        return 'All tracked ports are in use — plan an expansion or uplink before adding new devices.';
    if (daysToPortExhaustion != null && daysToPortExhaustion < 60)
        return `Projected to run out of free ports in ~${daysToPortExhaustion}d — plan an expansion or uplink.`;
    if (status === 'Offline')
        return 'Reported status is Offline — verify connectivity.';
    if (status === 'Warning')
        return 'Reported status is Warning — review recent alerts on this switch.';
    if (!hasPortCount)
        return 'Set a Port Count on this device and log a few port-utilization snapshots to unlock capacity forecasting.';
    if (riskBand === 'healthy')
        return 'Stable — no action needed.';
    return 'Monitor — port utilization is within tolerance but worth a periodic check.';
}
//# sourceMappingURL=predictive-analytics.service.js.map