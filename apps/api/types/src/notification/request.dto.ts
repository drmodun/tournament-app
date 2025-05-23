import { notificationTypeEnumType } from "src/enums";

export interface INotificationQueryDto {
  isRead?: boolean;
  userId?: number;
  type?: notificationTypeEnumType;
}
