"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudinaryModule = exports.CLOUDINARY = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const cloudinary_1 = require("cloudinary");
exports.CLOUDINARY = 'CLOUDINARY';
const logger = new common_1.Logger('CloudinaryModule');
let CloudinaryModule = class CloudinaryModule {
};
exports.CloudinaryModule = CloudinaryModule;
exports.CloudinaryModule = CloudinaryModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [config_1.ConfigModule],
        providers: [
            {
                provide: exports.CLOUDINARY,
                inject: [config_1.ConfigService],
                useFactory: (config) => {
                    const cloud_name = config.get('CLOUDINARY_CLOUD_NAME');
                    const api_key = config.get('CLOUDINARY_API_KEY');
                    const api_secret = config.get('CLOUDINARY_API_SECRET');
                    if (!cloud_name || !api_key || !api_secret) {
                        logger.warn('Cloudinary is not configured — image upload endpoints will return 503 until backend/.env has CLOUDINARY_CLOUD_NAME/CLOUDINARY_API_KEY/CLOUDINARY_API_SECRET.');
                        return null;
                    }
                    cloudinary_1.v2.config({
                        cloud_name,
                        api_key,
                        api_secret,
                        secure: true,
                    });
                    return cloudinary_1.v2;
                },
            },
        ],
        exports: [exports.CLOUDINARY],
    })
], CloudinaryModule);
//# sourceMappingURL=cloudinary.module.js.map