import { IsIn } from 'class-validator';

export const MESSAGE_STATUSES = ['New', 'Read', 'Archived'] as const;
export type MessageStatus = (typeof MESSAGE_STATUSES)[number];

export class UpdateMessageStatusDto {
  @IsIn(MESSAGE_STATUSES)
  status: MessageStatus;
}
