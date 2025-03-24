import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  INotificationQueryDto,
  notificationTypeEnumType,
} from '@tournament-app/types';
import { Transform } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional } from 'class-validator';
import { BaseQuery } from 'src/base/query/baseQuery';

export class NotificationQueryDto
  extends BaseQuery
  implements INotificationQueryDto
{
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => Boolean(value))
  @IsBoolean()
  isRead?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  userId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  type?: notificationTypeEnumType;
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
