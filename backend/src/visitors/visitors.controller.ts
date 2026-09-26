import { Controller, Get, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { VisitorsService } from './visitors.service';

@Controller('visitors')
@UseGuards(FirebaseAuthGuard)
export class VisitorsController {
  constructor(private readonly visitorsService: VisitorsService) {}

  @Get()
  list() {
    return this.visitorsService.list();
  }
}
