import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FirebaseModule } from './firebase/firebase.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { UploadsModule } from './uploads/uploads.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { PredictiveAnalyticsModule } from './predictive-analytics/predictive-analytics.module';
import { ResourceUtilizationModule } from './resource-utilization/resource-utilization.module';
import { AuthModule } from './auth/auth.module';
import { ApartmentsModule } from './apartments/apartments.module';
import { TenantsModule } from './tenants/tenants.module';
import { BookingsModule } from './bookings/bookings.module';
import { PaymentsModule } from './payments/payments.module';
import { MessagesModule } from './messages/messages.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { VisitorsModule } from './visitors/visitors.module';
import { LogsModule } from './logs/logs.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    FirebaseModule,
    CloudinaryModule,
    UploadsModule,
    AnalyticsModule,
    PredictiveAnalyticsModule,
    ResourceUtilizationModule,
    AuthModule,
    ApartmentsModule,
    TenantsModule,
    BookingsModule,
    PaymentsModule,
    MessagesModule,
    DashboardModule,
    VisitorsModule,
    LogsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
