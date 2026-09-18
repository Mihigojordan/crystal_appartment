"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirebaseModule = exports.FIREBASE_AUTH = exports.FIRESTORE = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_1 = require("firebase-admin/app");
const auth_1 = require("firebase-admin/auth");
const firestore_1 = require("firebase-admin/firestore");
exports.FIRESTORE = 'FIRESTORE';
exports.FIREBASE_AUTH = 'FIREBASE_AUTH';
const logger = new common_1.Logger('FirebaseModule');
function initApp(config) {
    return ((0, app_1.getApps)()[0] ??
        (0, app_1.initializeApp)({
            credential: (0, app_1.cert)({
                projectId: config.get('FIREBASE_PROJECT_ID'),
                clientEmail: config.get('FIREBASE_CLIENT_EMAIL'),
                privateKey: config
                    .get('FIREBASE_PRIVATE_KEY')
                    ?.replace(/\\n/g, '\n'),
            }),
        }));
}
let FirebaseModule = class FirebaseModule {
};
exports.FirebaseModule = FirebaseModule;
exports.FirebaseModule = FirebaseModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [config_1.ConfigModule],
        providers: [
            {
                provide: exports.FIRESTORE,
                inject: [config_1.ConfigService],
                useFactory: (config) => {
                    try {
                        const firestore = (0, firestore_1.getFirestore)(initApp(config));
                        firestore.settings({ ignoreUndefinedProperties: true });
                        return firestore;
                    }
                    catch (err) {
                        logger.warn(`Firebase not configured (${err.message}) — Firestore-backed endpoints will return 503 until backend/.env has a real FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY.`);
                        return null;
                    }
                },
            },
            {
                provide: exports.FIREBASE_AUTH,
                inject: [config_1.ConfigService],
                useFactory: (config) => {
                    try {
                        return (0, auth_1.getAuth)(initApp(config));
                    }
                    catch (err) {
                        logger.warn(`Firebase Auth not configured (${err.message}) — guarded endpoints will return 503 until backend/.env has a real FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY.`);
                        return null;
                    }
                },
            },
        ],
        exports: [exports.FIRESTORE, exports.FIREBASE_AUTH],
    })
], FirebaseModule);
//# sourceMappingURL=firebase.module.js.map