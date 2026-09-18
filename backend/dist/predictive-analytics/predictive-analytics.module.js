"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PredictiveAnalyticsModule = void 0;
const common_1 = require("@nestjs/common");
const device_data_service_1 = require("./device-data.service");
const predictive_analytics_controller_1 = require("./predictive-analytics.controller");
const predictive_analytics_service_1 = require("./predictive-analytics.service");
let PredictiveAnalyticsModule = class PredictiveAnalyticsModule {
};
exports.PredictiveAnalyticsModule = PredictiveAnalyticsModule;
exports.PredictiveAnalyticsModule = PredictiveAnalyticsModule = __decorate([
    (0, common_1.Module)({
        controllers: [predictive_analytics_controller_1.PredictiveAnalyticsController],
        providers: [device_data_service_1.DeviceDataService, predictive_analytics_service_1.PredictiveAnalyticsService],
    })
], PredictiveAnalyticsModule);
//# sourceMappingURL=predictive-analytics.module.js.map