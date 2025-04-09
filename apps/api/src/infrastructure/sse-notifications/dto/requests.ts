import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  INotificationQueryDto,
  notificationTypeEnumType,
} from '@tournament-app/types';
import { Transform } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';
import { BaseQuery } from 'src/base/query/baseQuery';

export class NotificationQueryDto
  extends BaseQuery
  implements INotificationQueryDto
{
  @ApiPropertyOptional({
    description: 'Is read',
    required: false,
    example: false,
  })
  @IsOptional()
  @Transform(({ value }) => (value ? value === 'true' : undefined))
  @IsBoolean()
  isRead?: boolean;

  @ApiPropertyOptional({
    description: 'User ID',
    required: false,
    example: 123,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  userId?: number;

  @ApiPropertyOptional({
    description: 'Notification types',
    required: false,
    example: ['match', 'tournament'],
  } )
  @IsOptional()
  @IsString({ each: true })
  @Transform(({ value }) => value.split(','))
  types?: notificationTypeEnumType[];
}

export class NotificationResponseDto {
  id: number;
  userId: number;
  message: string;
  link: string;
  image: string;
  type: string;
  createdAt: Date;
  read: boolean;
}
