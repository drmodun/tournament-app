import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import {
  INotificationResponseDto,
  notificationTypeEnumType,
} from '@tournament-app/types';

export class NotificationsResponse implements INotificationResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the notification',
    readOnly: true,
    example: 123,
  })
  id: number;

  @ApiProperty({
    description: 'ID of the user',
    readOnly: true,
    example: 456,
  })
  userId: number;

  @ApiProperty({
    description: 'Message for the notification',
    readOnly: true,
    example: 'You have a new match',
  })
  message: string;

  @ApiProperty({
    description: 'Link for the notification',
    readOnly: true,
    example: 'https://example.com',
  })
  link: string | null;

  @ApiProperty({
    description: 'Image for the notification',
    readOnly: true,
    example: 'https://example.com',
  })
  image: string | null;

  @ApiProperty({
    description: 'Type of the notification',
    readOnly: true,
    example: 'match',
  })
  type: notificationTypeEnumType;

  @ApiProperty({
    description: 'Date when the notification was created',
    readOnly: true,
    example: '2023-01-15T12:30:45Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Is read',
    readOnly: true,
    example: false,
  })
  read: boolean;
}
