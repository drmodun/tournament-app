import { ApiResponseProperty } from '@nestjs/swagger';
import {
  INotificationSettingsResponse,
  INotificationTokenResponse,
} from '@tournament-app/types';

export class NotificationSettingsResponse implements INotificationSettingsResponse {
  @ApiResponseProperty()
  userId: number;

  @ApiResponseProperty()
  emailNotifications: boolean;

  @ApiResponseProperty()
  pushNotifications: boolean;

  @ApiResponseProperty()
  inAppNotifications: boolean;
}

export class NotificationTokenResponse implements INotificationTokenResponse {
  @ApiResponseProperty()
  id: number;

  @ApiResponseProperty()
  token: string;

  @ApiResponseProperty()
  createdAt: Date;
}
