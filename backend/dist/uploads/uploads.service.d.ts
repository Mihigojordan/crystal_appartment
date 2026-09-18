import { CloudinaryClient } from '../cloudinary/cloudinary.module';
export declare class UploadsService {
    private readonly cloudinary;
    constructor(cloudinary: CloudinaryClient | null);
    private upload;
    uploadImage(file: Express.Multer.File): Promise<{
        url: string;
        publicId: string;
    }>;
    uploadPaymentScreenshot(file: Express.Multer.File): Promise<{
        url: string;
        publicId: string;
    }>;
}
