import {
  Inject,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { FieldValue, Firestore, Timestamp } from 'firebase-admin/firestore';
import { FIRESTORE } from '../firebase/firebase.module';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessageStatus } from './dto/update-message-status.dto';

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: MessageStatus;
  createdAt: string | null;
}

interface RawMessageData {
  name?: string;
  email?: string;
  phone?: string | null;
  message?: string;
  status?: MessageStatus;
  createdAt?: Timestamp;
}

const COLLECTION = 'messages';

@Injectable()
export class MessagesService {
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

  private toMessage(id: string, data: RawMessageData): ContactMessage {
    return {
      id,
      name: data.name ?? '',
      email: data.email ?? '',
      phone: data.phone ?? null,
      message: data.message ?? '',
      status: data.status ?? 'New',
      createdAt: data.createdAt?.toDate().toISOString() ?? null,
    };
  }

  async create(dto: CreateMessageDto): Promise<ContactMessage> {
    const ref = await this.db()
      .collection(COLLECTION)
      .add({
        ...dto,
        phone: dto.phone ?? null,
        status: 'New',
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    const doc = await ref.get();
    return this.toMessage(doc.id, doc.data() as RawMessageData);
  }

  async list(): Promise<ContactMessage[]> {
    const snap = await this.db()
      .collection(COLLECTION)
      .orderBy('createdAt', 'desc')
      .get();
    return snap.docs.map((doc) => this.toMessage(doc.id, doc.data()));
  }

  async updateStatus(
    id: string,
    status: MessageStatus,
  ): Promise<ContactMessage> {
    const ref = this.db().collection(COLLECTION).doc(id);
    const doc = await ref.get();
    if (!doc.exists) throw new NotFoundException('Message not found');
    await ref.update({ status, updatedAt: FieldValue.serverTimestamp() });
    const updated = await ref.get();
    return this.toMessage(updated.id, updated.data() as RawMessageData);
  }

  async remove(id: string): Promise<{ id: string }> {
    const ref = this.db().collection(COLLECTION).doc(id);
    const doc = await ref.get();
    if (!doc.exists) throw new NotFoundException('Message not found');
    await ref.delete();
    return { id };
  }
}
