import { notificationTypeEnumType } from "src/enums";

export interface INotificationQueryDto {
  isRead?: boolean;
  userId?: number;
  type?: notificationTypeEnumType;
}

export interface IUpdateNotificationSettingsRequest {
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  inAppNotifications?: boolean;
}

export interface IRegisterNotificationTokenRequest {
  token: string;
}
