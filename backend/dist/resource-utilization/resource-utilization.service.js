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
exports.ResourceUtilizationService = void 0;
const common_1 = require("@nestjs/common");
const device_data_service_1 = require("../predictive-analytics/device-data.service");
const trend_util_1 = require("../predictive-analytics/trend.util");
function round1(v) {
    return Math.round(v * 10) / 10;
}
function mean(values) {
    return values.length
        ? round1(values.reduce((s, v) => s + v, 0) / values.length)
        : null;
}
let ResourceUtilizationService = class ResourceUtilizationService {
    deviceData;
    constructor(deviceData) {
        this.deviceData = deviceData;
    }
    async getSummary() {
        const [servers, storage, switches] = await Promise.all([
            this.deviceData.getServers(),
            this.deviceData.getStorage(),
            this.deviceData.getSwitches(),
        ]);
        const serverDevices = servers.map((s) => ({
            id: s.id,
            name: s.name,
            role: s.role,
            location: s.location,
            status: s.status,
            cpuPct: (0, trend_util_1.pct)(s.cpuUsed, s.cpuCapacity),
            ramUsedGb: s.ramUsedGb,
            ramTotalGb: s.ramTotalGb,
            ramPct: (0, trend_util_1.pct)(s.ramUsedGb, s.ramTotalGb),
            diskUsedGb: s.storageUsedGb,
            diskTotalGb: s.storageTotalGb,
            diskPct: (0, trend_util_1.pct)(s.storageUsedGb, s.storageTotalGb),
        }));
        const totalRamUsedGb = round1(serverDevices.reduce((sum, d) => sum + d.ramUsedGb, 0));
        const totalRamTotalGb = round1(serverDevices.reduce((sum, d) => sum + d.ramTotalGb, 0));
        const totalDiskUsedGb = round1(serverDevices.reduce((sum, d) => sum + d.diskUsedGb, 0));
        const totalDiskTotalGb = round1(serverDevices.reduce((sum, d) => sum + d.diskTotalGb, 0));
        const storageDevices = storage.map((s) => ({
            id: s.id,
            name: s.name,
            type: s.type,
            location: s.location,
            status: s.status,
            capacityUsedGb: s.capacityUsedGb,
            capacityTotalGb: s.capacityTotalGb,
            capacityPct: (0, trend_util_1.pct)(s.capacityUsedGb, s.capacityTotalGb),
            latencyMs: s.latencyMs,
            iops: s.iops,
            throughputMbps: s.throughputMbps,
        }));
        const totalCapacityUsedGb = round1(storageDevices.reduce((sum, d) => sum + d.capacityUsedGb, 0));
        const totalCapacityTotalGb = round1(storageDevices.reduce((sum, d) => sum + d.capacityTotalGb, 0));
        const switchDevices = switches.map((s) => ({
            id: s.id,
            name: s.name,
            model: s.model,
            location: s.location,
            status: s.status,
            portCount: s.portCount,
            portsUp: s.portsUp,
            portPct: s.portCount > 0 ? (0, trend_util_1.pct)(s.portsUp, s.portCount) : null,
        }));
        const totalPorts = switchDevices.reduce((sum, d) => sum + d.portCount, 0);
        const totalPortsUp = switchDevices.reduce((sum, d) => sum + d.portsUp, 0);
        const statusCounts = {};
        for (const d of switchDevices) {
            statusCounts[d.status] = (statusCounts[d.status] ?? 0) + 1;
        }
        return {
            generatedAt: new Date().toISOString(),
            servers: {
                devices: serverDevices,
                fleet: {
                    count: serverDevices.length,
                    avgCpuPct: mean(serverDevices.map((d) => d.cpuPct)),
                    totalRamUsedGb,
                    totalRamTotalGb,
                    ramPct: (0, trend_util_1.pct)(totalRamUsedGb, totalRamTotalGb),
                    totalDiskUsedGb,
                    totalDiskTotalGb,
                    diskPct: (0, trend_util_1.pct)(totalDiskUsedGb, totalDiskTotalGb),
                },
            },
            storage: {
                devices: storageDevices,
                fleet: {
                    count: storageDevices.length,
                    totalCapacityUsedGb,
                    totalCapacityTotalGb,
                    capacityPct: (0, trend_util_1.pct)(totalCapacityUsedGb, totalCapacityTotalGb),
                    avgLatencyMs: mean(storageDevices.map((d) => d.latencyMs)),
                    totalIops: storageDevices.reduce((sum, d) => sum + d.iops, 0),
                    totalThroughputMbps: storageDevices.reduce((sum, d) => sum + d.throughputMbps, 0),
                },
            },
            switches: {
                devices: switchDevices,
                fleet: {
                    count: switchDevices.length,
                    totalPorts,
                    totalPortsUp,
                    portPct: totalPorts > 0
                        ? (0, trend_util_1.clamp)((0, trend_util_1.pct)(totalPortsUp, totalPorts), 0, 100)
                        : null,
                    statusCounts,
                },
            },
        };
    }
};
exports.ResourceUtilizationService = ResourceUtilizationService;
exports.ResourceUtilizationService = ResourceUtilizationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [device_data_service_1.DeviceDataService])
], ResourceUtilizationService);
//# sourceMappingURL=resource-utilization.service.js.map