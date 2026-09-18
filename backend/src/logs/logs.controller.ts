import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { ClientErrorDto } from './dto/client-error.dto';
import { LogsService } from './logs.service';

@Controller('logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get()
  @UseGuards(FirebaseAuthGuard)
  list() {
    return this.logsService.list();
  }

  @Delete(':id')
  @UseGuards(FirebaseAuthGuard)
  remove(@Param('id') id: string) {
    return this.logsService.remove(id);
  }

  // Public and unauthenticated on purpose — anonymous visitors on the
  // public site hit JS errors too, long before any admin session exists.
  @Post('client-error')
  @HttpCode(202)
  async clientError(@Body() dto: ClientErrorDto) {
    await this.logsService.recordClientError(dto);
    return { received: true };
  }
}
