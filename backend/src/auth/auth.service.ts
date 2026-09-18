import {
  Inject,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Firestore } from 'firebase-admin/firestore';
import { FIRESTORE } from '../firebase/firebase.module';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AdminProfile } from './firebase-auth.guard';

@Injectable()
export class AuthService {
  constructor(
    @Inject(FIRESTORE) private readonly firestore: Firestore | null,
  ) {}

  private db(): Firestore {
    if (!this.firestore) {
      throw new ServiceUnavailableException(
        'Firebase is not configured — check backend/.env',
      );
    }
    return this.firestore;
  }

  async updateProfileByEmail(
    email: string,
    patch: UpdateProfileDto,
  ): Promise<AdminProfile> {
    const snap = await this.db()
      .collection('users')
      .where('email', '==', email)
      .limit(1)
      .get();
    if (snap.empty) throw new NotFoundException('Admin profile not found');

    const doc = snap.docs[0];
    await doc.ref.update({ ...patch });
    const updated = await doc.ref.get();
    return { id: updated.id, ...updated.data() } as AdminProfile;
  }
}
