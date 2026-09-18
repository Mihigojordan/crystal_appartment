import { Firestore } from 'firebase-admin/firestore';
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
export declare class MessagesService {
    private readonly firestore;
    constructor(firestore: Firestore | null);
    private db;
    private toMessage;
    create(dto: CreateMessageDto): Promise<ContactMessage>;
    list(): Promise<ContactMessage[]>;
    updateStatus(id: string, status: MessageStatus): Promise<ContactMessage>;
    remove(id: string): Promise<{
        id: string;
    }>;
}
