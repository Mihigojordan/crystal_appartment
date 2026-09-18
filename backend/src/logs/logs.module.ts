import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AllExceptionsFilter } from './all-exceptions.filter';
import { LogsController } from './logs.controller';
import { LogsService } from './logs.service';

@Module({
  imports: [AuthModule],
  controllers: [LogsController],
  providers: [LogsService, AllExceptionsFilter],
  exports: [LogsService, AllExceptionsFilter],
})
export class LogsModule {}
