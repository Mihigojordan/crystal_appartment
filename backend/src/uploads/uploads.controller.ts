import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { UploadsService } from './uploads.service';

const IMAGE_SIZE_LIMIT = { limits: { fileSize: 8 * 1024 * 1024 } };

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('image')
  @UseGuards(FirebaseAuthGuard)
  @UseInterceptors(FileInterceptor('file', IMAGE_SIZE_LIMIT))
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    return this.uploadsService.uploadImage(file);
  }

  // Public and unauthenticated on purpose — the booking flow's mobile money
  // step needs to upload a payment screenshot before a guest has any
  // account. Kept in its own Cloudinary folder, separate from admin-only
  // apartment photo uploads.
  @Post('payment-screenshot')
  @UseInterceptors(FileInterceptor('file', IMAGE_SIZE_LIMIT))
  uploadPaymentScreenshot(@UploadedFile() file: Express.Multer.File) {
    return this.uploadsService.uploadPaymentScreenshot(file);
  }
}
