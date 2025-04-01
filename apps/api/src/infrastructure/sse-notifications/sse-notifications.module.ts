import { Module } from '@nestjs/common';
import { SseNotificationsService } from './sse-notifications.service';
import { SseNotificationRepository } from './sse-notification.repository';
import { SseNotificationsController } from './sse-notifications.controller';
import { NotificationTemplatesFiller } from '../firebase-notifications/templates';
@Module({
  providers: [
    SseNotificationRepository,
    SseNotificationsService,
    NotificationTemplatesFiller,
  ],
  controllers: [SseNotificationsController],
  exports: [
    SseNotificationRepository,
    SseNotificationsService,
    NotificationTemplatesFiller,
  ],
})
export class SseNotificationsModule {}
