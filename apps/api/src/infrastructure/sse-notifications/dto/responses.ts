import { ApiResponseProperty } from '@nestjs/swagger';
import {
  INotificationResponseDto,
  notificationTypeEnumType,
} from '@tournament-app/types';

export class NotificationsResponse implements INotificationResponseDto {
  @ApiResponseProperty()
  id: number;

  @ApiResponseProperty()
  userId: number;

  @ApiResponseProperty()
  message: string;

  @ApiResponseProperty()
  link: string | null;

  @ApiResponseProperty()
  image: string | null;

  @ApiResponseProperty()
  type: notificationTypeEnumType;

  @ApiResponseProperty()
  createdAt: Date;

  @ApiResponseProperty()
  read: boolean;
}
