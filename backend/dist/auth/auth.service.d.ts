import { Firestore } from 'firebase-admin/firestore';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AdminProfile } from './firebase-auth.guard';
export declare class AuthService {
    private readonly firestore;
    constructor(firestore: Firestore | null);
    private db;
    updateProfileByEmail(email: string, patch: UpdateProfileDto): Promise<AdminProfile>;
}
