import {
  BadRequestException,
  Inject,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import * as streamifier from 'streamifier';
import { CLOUDINARY, CloudinaryClient } from '../cloudinary/cloudinary.module';

const FOLDER = 'crystal-apartment';
const PAYMENT_SCREENSHOTS_FOLDER = 'crystal-apartment/payment-screenshots';

@Injectable()
export class UploadsService {
  constructor(
    @Inject(CLOUDINARY) private readonly cloudinary: CloudinaryClient | null,
  ) {}

  private upload(
    file: Express.Multer.File,
    folder: string,
  ): Promise<{ url: string; publicId: string }> {
    if (!this.cloudinary) {
      throw new ServiceUnavailableException(
        'Cloudinary is not configured — check backend/.env',
      );
    }
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    if (!file.mimetype?.startsWith('image/')) {
      throw new BadRequestException('Only image files are allowed');
    }

    const cloudinary = this.cloudinary;
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'image' },
        (error, result) => {
          if (error || !result) {
            reject(
              error instanceof Error
                ? error
                : new Error('Cloudinary upload failed'),
            );
            return;
          }
          resolve({ url: result.secure_url, publicId: result.public_id });
        },
      );
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  uploadImage(file: Express.Multer.File) {
    return this.upload(file, FOLDER);
  }

  uploadPaymentScreenshot(file: Express.Multer.File) {
    return this.upload(file, PAYMENT_SCREENSHOTS_FOLDER);
  }
}
