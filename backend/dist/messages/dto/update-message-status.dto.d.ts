export declare const MESSAGE_STATUSES: readonly ["New", "Read", "Archived"];
export type MessageStatus = (typeof MESSAGE_STATUSES)[number];
export declare class UpdateMessageStatusDto {
    status: MessageStatus;
}
