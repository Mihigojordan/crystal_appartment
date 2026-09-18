import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageStatusDto } from './dto/update-message-status.dto';
export declare class MessagesController {
    private readonly messagesService;
    constructor(messagesService: MessagesService);
    create(dto: CreateMessageDto): Promise<import("./messages.service").ContactMessage>;
    list(): Promise<import("./messages.service").ContactMessage[]>;
    updateStatus(id: string, dto: UpdateMessageStatusDto): Promise<import("./messages.service").ContactMessage>;
    remove(id: string): Promise<{
        id: string;
    }>;
}
