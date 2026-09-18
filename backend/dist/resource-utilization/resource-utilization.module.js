"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceUtilizationModule = void 0;
const common_1 = require("@nestjs/common");
const device_data_service_1 = require("../predictive-analytics/device-data.service");
const resource_utilization_controller_1 = require("./resource-utilization.controller");
const resource_utilization_service_1 = require("./resource-utilization.service");
let ResourceUtilizationModule = class ResourceUtilizationModule {
};
exports.ResourceUtilizationModule = ResourceUtilizationModule;
exports.ResourceUtilizationModule = ResourceUtilizationModule = __decorate([
    (0, common_1.Module)({
        controllers: [resource_utilization_controller_1.ResourceUtilizationController],
        providers: [device_data_service_1.DeviceDataService, resource_utilization_service_1.ResourceUtilizationService],
    })
], ResourceUtilizationModule);
//# sourceMappingURL=resource-utilization.module.js.map