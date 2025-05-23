import { notificationTypeEnumType } from "../enums";

export interface INotificationQueryDto {
  isRead?: boolean;
  userId?: number;
  type?: notificationTypeEnumType;
}
