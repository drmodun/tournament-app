import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SseNotificationsService } from './sse-notifications.service';
import { SseNotificationRepository } from './sse-notification.repository';
import { SseNotificationsController } from './sse-notifications.controller';
import { NotificationTemplatesFiller } from './templates';
import { NotificationBus } from './notification-bus';
import { NotificationSettingsModule } from 'src/notification-settings/notification-settings.module';
@Module({
  imports: [JwtModule.register({}), NotificationSettingsModule],
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
