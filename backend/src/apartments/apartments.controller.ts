import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { ApartmentsService } from './apartments.service';
import { CreateApartmentDto } from './dto/create-apartment.dto';
import { UpdateApartmentDto } from './dto/update-apartment.dto';

@Controller('apartments')
export class ApartmentsController {
  constructor(private readonly apartmentsService: ApartmentsService) {}

  // Public and unauthenticated on purpose — the marketing site's listings
  // section and apartment detail pages read from here. Declared before the
  // admin `:id` route below so "public" isn't swallowed as an :id value.
  @Get('public')
  listPublic() {
    return this.apartmentsService.listPublic();
  }

  @Get('public/:id')
  findOnePublic(@Param('id') id: string) {
    return this.apartmentsService.findOnePublic(id);
  }

  @Get()
  @UseGuards(FirebaseAuthGuard)
  list() {
    return this.apartmentsService.list();
  }

  @Get(':id')
  @UseGuards(FirebaseAuthGuard)
  findOne(@Param('id') id: string) {
    return this.apartmentsService.findOne(id);
  }

  @Post()
  @UseGuards(FirebaseAuthGuard)
  create(@Body() dto: CreateApartmentDto) {
    return this.apartmentsService.create(dto);
  }

  @Patch(':id')
  @UseGuards(FirebaseAuthGuard)
  update(@Param('id') id: string, @Body() dto: UpdateApartmentDto) {
    return this.apartmentsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(FirebaseAuthGuard)
  remove(@Param('id') id: string) {
    return this.apartmentsService.remove(id);
  }
}
