import { PartialType } from '@nestjs/mapped-types';
import { CreateSseNotificationDto } from './create-sse-notification.dto';

export class UpdateSseNotificationDto extends PartialType(CreateSseNotificationDto) {
  id: number;
}
