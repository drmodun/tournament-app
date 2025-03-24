import { Injectable } from '@nestjs/common';
import { CreateSseNotificationDto } from './dto/create-sse-notification.dto';
import { UpdateSseNotificationDto } from './dto/update-sse-notification.dto';

@Injectable()
export class SseNotificationsService {
  create(createSseNotificationDto: CreateSseNotificationDto) {
    return 'This action adds a new sseNotification';
  }

  findAll() {
    return `This action returns all sseNotifications`;
  }

  findOne(id: number) {
    return `This action returns a #${id} sseNotification`;
  }

  update(id: number, updateSseNotificationDto: UpdateSseNotificationDto) {
    return `This action updates a #${id} sseNotification`;
  }

  remove(id: number) {
    return `This action removes a #${id} sseNotification`;
  }
}
