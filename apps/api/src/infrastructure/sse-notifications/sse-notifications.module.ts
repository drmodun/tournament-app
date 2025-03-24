import { Module } from '@nestjs/common';
import { SseNotificationsService } from './sse-notifications.service';
import { SseNotificationsGateway } from './sse-notifications.gateway';

@Module({
  providers: [SseNotificationsGateway, SseNotificationsService],
})
export class SseNotificationsModule {}
