import { Module } from '@nestjs/common';
import { NotificationSettingsController } from './notification-settings.controller';
import { NotificationSettingsRepository } from './notification-settings.repository';
import { NotificationSettingsService } from './notification-settings.service';

@Module({
  controllers: [NotificationSettingsController],
  providers: [NotificationSettingsService, NotificationSettingsRepository],
  exports: [NotificationSettingsService],
})
export class NotificationSettingsModule {}
