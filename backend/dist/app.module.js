"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const firebase_module_1 = require("./firebase/firebase.module");
const cloudinary_module_1 = require("./cloudinary/cloudinary.module");
const uploads_module_1 = require("./uploads/uploads.module");
const analytics_module_1 = require("./analytics/analytics.module");
const predictive_analytics_module_1 = require("./predictive-analytics/predictive-analytics.module");
const resource_utilization_module_1 = require("./resource-utilization/resource-utilization.module");
const auth_module_1 = require("./auth/auth.module");
const apartments_module_1 = require("./apartments/apartments.module");
const tenants_module_1 = require("./tenants/tenants.module");
const bookings_module_1 = require("./bookings/bookings.module");
const payments_module_1 = require("./payments/payments.module");
const messages_module_1 = require("./messages/messages.module");
const dashboard_module_1 = require("./dashboard/dashboard.module");
const visitors_module_1 = require("./visitors/visitors.module");
const logs_module_1 = require("./logs/logs.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            firebase_module_1.FirebaseModule,
            cloudinary_module_1.CloudinaryModule,
            uploads_module_1.UploadsModule,
            analytics_module_1.AnalyticsModule,
            predictive_analytics_module_1.PredictiveAnalyticsModule,
            resource_utilization_module_1.ResourceUtilizationModule,
            auth_module_1.AuthModule,
            apartments_module_1.ApartmentsModule,
            tenants_module_1.TenantsModule,
            bookings_module_1.BookingsModule,
            payments_module_1.PaymentsModule,
            messages_module_1.MessagesModule,
            dashboard_module_1.DashboardModule,
            visitors_module_1.VisitorsModule,
            logs_module_1.LogsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map