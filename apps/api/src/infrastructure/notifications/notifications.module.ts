import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationTemplatesFiller } from './templates';
import { FirebaseAdminFactory } from './firebase-admin.factory';

@Module({
  providers: [
    NotificationsService,
    NotificationTemplatesFiller,
    FirebaseAdminFactory,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
