import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SseNotificationsService } from './sse-notifications.service';
import { SseNotificationRepository } from './sse-notification.repository';
import { SseNotificationsController } from './sse-notifications.controller';
import { NotificationTemplatesFiller } from './templates';
import { NotificationBus } from './notification-bus';
@Module({
  imports: [JwtModule.register({})],
  providers: [
    SseNotificationRepository,
    SseNotificationsService,
    NotificationTemplatesFiller,
    NotificationBus,
  ],
  controllers: [SseNotificationsController],
  exports: [
    SseNotificationRepository,
    SseNotificationsService,
    NotificationTemplatesFiller,
  ],
})
export class SseNotificationsModule {}
