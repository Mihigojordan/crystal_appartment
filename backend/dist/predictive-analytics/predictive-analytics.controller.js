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
exports.PredictiveAnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const predictive_analytics_service_1 = require("./predictive-analytics.service");
let PredictiveAnalyticsController = class PredictiveAnalyticsController {
    predictive;
    constructor(predictive) {
        this.predictive = predictive;
    }
    getServers() {
        return this.predictive.predictServers();
    }
    getStorage() {
        return this.predictive.predictStorage();
    }
    getSwitches() {
        return this.predictive.predictSwitches();
    }
};
exports.PredictiveAnalyticsController = PredictiveAnalyticsController;
__decorate([
    (0, common_1.Get)('servers'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PredictiveAnalyticsController.prototype, "getServers", null);
__decorate([
    (0, common_1.Get)('storage'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PredictiveAnalyticsController.prototype, "getStorage", null);
__decorate([
    (0, common_1.Get)('switches'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PredictiveAnalyticsController.prototype, "getSwitches", null);
exports.PredictiveAnalyticsController = PredictiveAnalyticsController = __decorate([
    (0, common_1.Controller)('infra/predictive-analytics'),
    __metadata("design:paramtypes", [predictive_analytics_service_1.PredictiveAnalyticsService])
], PredictiveAnalyticsController);
//# sourceMappingURL=predictive-analytics.controller.js.map