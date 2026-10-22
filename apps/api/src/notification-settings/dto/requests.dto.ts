import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IRegisterNotificationTokenRequest,
  IUpdateNotificationSettingsRequest,
} from '@tournament-app/types';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateNotificationSettingsRequest implements IUpdateNotificationSettingsRequest {
  @ApiPropertyOptional({
    description: 'Stored for when notifications are sent by email',
  })
  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @ApiPropertyOptional({
    description: 'Stored for when push notifications are sent',
  })
  @IsOptional()
  @IsBoolean()
  pushNotifications?: boolean;

  @ApiPropertyOptional({
    description:
      'When false, new notifications are neither stored for the user nor sent to their stream',
  })
  @IsOptional()
  @IsBoolean()
  inAppNotifications?: boolean;
}

export class RegisterNotificationTokenRequest implements IRegisterNotificationTokenRequest {
  @ApiProperty({ description: 'A device push token, such as an FCM token' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(4096)
  token: string;
}
