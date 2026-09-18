import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import type { Auth, DecodedIdToken } from 'firebase-admin/auth';
import { FieldValue } from 'firebase-admin/firestore';
import type { Firestore } from 'firebase-admin/firestore';
import type { Request } from 'express';
import { FIREBASE_AUTH, FIRESTORE } from '../firebase/firebase.module';

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

// Firestore 'users' docs (written by scripts/seed-admin.ts) are keyed by
// email, not uid — there's no uid field on them — so profile lookup here
// has to match on email rather than the token's uid.
@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(
    @Inject(FIREBASE_AUTH) private readonly auth: Auth | null,
    @Inject(FIRESTORE) private readonly firestore: Firestore | null,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!this.auth || !this.firestore) {
      throw new ServiceUnavailableException(
        'Firebase is not configured — check backend/.env',
      );
    }

    const req = context.switchToHttp().getRequest<Request>();
    const header = req.headers.authorization;
    const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw new UnauthorizedException('Missing bearer token');

    let decoded: DecodedIdToken;
    try {
      decoded = await this.auth.verifyIdToken(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
    if (!decoded.email) throw new UnauthorizedException('Token has no email');

    const snap = await this.firestore
      .collection('users')
      .where('email', '==', decoded.email)
      .limit(1)
      .get();

    if (snap.empty) {
      // Google sign-ins with no existing profile self-provision as an
      // Administrator (open by design — see Login.jsx's "Continue with
      // Google"). Email/password sign-ins still require a profile seeded
      // via scripts/seed-admin.ts first.
      if (decoded.firebase.sign_in_provider !== 'google.com') {
        throw new ForbiddenException('No admin profile for this account');
      }
      const displayName: string =
        typeof decoded.name === 'string' ? decoded.name : decoded.email;
      const created = await this.firestore.collection('users').add({
        name: displayName,
        email: decoded.email,
        role: 'Administrator',
        department: '',
        phone: '',
        status: 'Active',
        createdAt: FieldValue.serverTimestamp(),
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
      throw new ForbiddenException('Account is not an administrator');
    }

    req.user = { uid: decoded.uid, email: decoded.email };
    req.profile = { id: doc.id, ...data } as AdminProfile;
    return true;
  }
}
