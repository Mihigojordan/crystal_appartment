import { Global, Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { v2 as cloudinary, ConfigOptions } from 'cloudinary';

export const CLOUDINARY = 'CLOUDINARY';
export type CloudinaryClient = typeof cloudinary;

const logger = new Logger('CloudinaryModule');

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: CLOUDINARY,
      inject: [ConfigService],
      // Same degrade-gracefully philosophy as FirebaseModule — a missing
      // config shouldn't crash boot, just 503 the upload endpoints until
      // backend/.env has real CLOUDINARY_* values.
      useFactory: (config: ConfigService): CloudinaryClient | null => {
        const cloud_name = config.get<string>('CLOUDINARY_CLOUD_NAME');
        const api_key = config.get<string>('CLOUDINARY_API_KEY');
        const api_secret = config.get<string>('CLOUDINARY_API_SECRET');
        if (!cloud_name || !api_key || !api_secret) {
          logger.warn(
            'Cloudinary is not configured — image upload endpoints will return 503 until backend/.env has CLOUDINARY_CLOUD_NAME/CLOUDINARY_API_KEY/CLOUDINARY_API_SECRET.',
          );
          return null;
        }
        cloudinary.config({
          cloud_name,
          api_key,
          api_secret,
          secure: true,
        } as ConfigOptions);
        return cloudinary;
      },
    },
  ],
  exports: [CLOUDINARY],
})
export class CloudinaryModule {}
