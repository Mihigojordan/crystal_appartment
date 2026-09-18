import {
  Inject,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { FieldValue, Firestore, Timestamp } from 'firebase-admin/firestore';
import { FIRESTORE } from '../firebase/firebase.module';
import { ClientErrorDto } from './dto/client-error.dto';

export interface ActivityLogEntry {
  id: string;
  activity: string;
  type: string;
  source: string;
  time: string | null;
}

interface RawActivityLogData {
  activity?: string;
  type?: string;
  source?: string;
  time?: Timestamp;
}

const COLLECTION = 'activityLogs';

@Injectable()
export class LogsService {
  constructor(
    @Inject(FIRESTORE) private readonly firestore: Firestore | null,
  ) {}

  async list(): Promise<{
    stats: {
      eventsToday: number;
      logins: number;
      warnings: number;
      errors: number;
    };
    entries: ActivityLogEntry[];
  }> {
    if (!this.firestore) {
      throw new ServiceUnavailableException(
        'Firebase is not configured — check backend/.env',
      );
    }
    const snap = await this.firestore
      .collection(COLLECTION)
      .orderBy('time', 'desc')
      .limit(100)
      .get();
    const entries: ActivityLogEntry[] = snap.docs.map((doc) => {
      const data = doc.data() as RawActivityLogData;
      return {
        id: doc.id,
        activity: data.activity ?? '',
        type: data.type ?? '',
        source: data.source ?? '',
        time: data.time?.toDate().toISOString() ?? null,
      };
    });

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const stats = {
      eventsToday: entries.filter(
        (e) => e.time && new Date(e.time) >= startOfToday,
      ).length,
      logins: entries.filter((e) => e.type === 'login').length,
      warnings: entries.filter((e) => e.type === 'warning').length,
      errors: entries.filter((e) => e.type === 'error').length,
    };

    return { stats, entries };
  }

  async record(activity: {
    activity: string;
    type: string;
    source: string;
  }): Promise<void> {
    if (!this.firestore) return;
    await this.firestore.collection(COLLECTION).add({
      ...activity,
      time: FieldValue.serverTimestamp(),
    });
  }

  async remove(id: string): Promise<{ id: string }> {
    if (!this.firestore) {
      throw new ServiceUnavailableException(
        'Firebase is not configured — check backend/.env',
      );
    }
    const ref = this.firestore.collection(COLLECTION).doc(id);
    const doc = await ref.get();
    if (!doc.exists) throw new NotFoundException('Log entry not found');
    await ref.delete();
    return { id };
  }

  async recordClientError(dto: ClientErrorDto): Promise<void> {
    if (!this.firestore) return;
    await this.firestore.collection(COLLECTION).add({
      activity: dto.message,
      type: dto.level ?? 'error',
      source: 'frontend',
      url: dto.url ?? null,
      userAgent: dto.userAgent ?? null,
      stack: dto.stack ?? null,
      time: FieldValue.serverTimestamp(),
    });
  }
}
