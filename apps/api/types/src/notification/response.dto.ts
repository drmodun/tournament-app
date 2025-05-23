import { notificationTypeEnumType } from "src/enums";

export interface INotificationResponseDto {
  id: number;
  userId: number;
  message: string;
  link: string | null;
  image: string | null;
  type: notificationTypeEnumType;
  createdAt: Date;
  read: boolean;
}
