"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirebaseAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const firestore_1 = require("firebase-admin/firestore");
const firebase_module_1 = require("../firebase/firebase.module");
let FirebaseAuthGuard = class FirebaseAuthGuard {
    auth;
    firestore;
    constructor(auth, firestore) {
        this.auth = auth;
        this.firestore = firestore;
    }
    async canActivate(context) {
        if (!this.auth || !this.firestore) {
            throw new common_1.ServiceUnavailableException('Firebase is not configured — check backend/.env');
        }
        const req = context.switchToHttp().getRequest();
        const header = req.headers.authorization;
        const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
        if (!token)
            throw new common_1.UnauthorizedException('Missing bearer token');
        let decoded;
        try {
            decoded = await this.auth.verifyIdToken(token);
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid or expired token');
        }
        if (!decoded.email)
            throw new common_1.UnauthorizedException('Token has no email');
        const snap = await this.firestore
            .collection('users')
            .where('email', '==', decoded.email)
            .limit(1)
            .get();
        if (snap.empty) {
            if (decoded.firebase.sign_in_provider !== 'google.com') {
                throw new common_1.ForbiddenException('No admin profile for this account');
            }
            const displayName = typeof decoded.name === 'string' ? decoded.name : decoded.email;
            const created = await this.firestore.collection('users').add({
                name: displayName,
                email: decoded.email,
                role: 'Administrator',
                department: '',
                phone: '',
                status: 'Active',
                createdAt: firestore_1.FieldValue.serverTimestamp(),
            });
            req.user = { uid: decoded.uid, email: decoded.email };
            req.profile = {
                id: created.id,
                name: displayName,
                email: decoded.email,
                role: 'Administrator',
                department: '',
                phone: '',
                status: 'Active',
            };
            return true;
        }
        const doc = snap.docs[0];
        const data = doc.data();
        if (data.role !== 'Administrator') {
            throw new common_1.ForbiddenException('Account is not an administrator');
        }
        req.user = { uid: decoded.uid, email: decoded.email };
        req.profile = { id: doc.id, ...data };
        return true;
    }
};
exports.FirebaseAuthGuard = FirebaseAuthGuard;
exports.FirebaseAuthGuard = FirebaseAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(firebase_module_1.FIREBASE_AUTH)),
    __param(1, (0, common_1.Inject)(firebase_module_1.FIRESTORE)),
    __metadata("design:paramtypes", [Object, Object])
], FirebaseAuthGuard);
//# sourceMappingURL=firebase-auth.guard.js.map