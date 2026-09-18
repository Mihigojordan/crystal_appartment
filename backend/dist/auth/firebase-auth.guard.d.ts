import { CanActivate, ExecutionContext } from '@nestjs/common';
import type { Auth } from 'firebase-admin/auth';
import type { Firestore } from 'firebase-admin/firestore';
export interface AuthenticatedUser {
    uid: string;
    email: string;
}
export interface AdminProfile {
    id: string;
    name: string;
    email: string;
    role: string;
    department?: string;
    phone?: string;
    status?: string;
    officeLocation?: string;
    bio?: string;
}
declare module 'express' {
    interface Request {
        user?: AuthenticatedUser;
        profile?: AdminProfile;
    }
}
export declare class FirebaseAuthGuard implements CanActivate {
    private readonly auth;
    private readonly firestore;
    constructor(auth: Auth | null, firestore: Firestore | null);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
