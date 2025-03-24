import { WebSocketGateway, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { SseNotificationsService } from './sse-notifications.service';
import { CreateSseNotificationDto } from './dto/create-sse-notification.dto';
import { UpdateSseNotificationDto } from './dto/update-sse-notification.dto';

@WebSocketGateway()
export class SseNotificationsGateway {
  constructor(private readonly sseNotificationsService: SseNotificationsService) {}

  @SubscribeMessage('createSseNotification')
  create(@MessageBody() createSseNotificationDto: CreateSseNotificationDto) {
    return this.sseNotificationsService.create(createSseNotificationDto);
  }

  @SubscribeMessage('findAllSseNotifications')
  findAll() {
    return this.sseNotificationsService.findAll();
  }

  @SubscribeMessage('findOneSseNotification')
  findOne(@MessageBody() id: number) {
    return this.sseNotificationsService.findOne(id);
  }

  @SubscribeMessage('updateSseNotification')
  update(@MessageBody() updateSseNotificationDto: UpdateSseNotificationDto) {
    return this.sseNotificationsService.update(updateSseNotificationDto.id, updateSseNotificationDto);
  }

  @SubscribeMessage('removeSseNotification')
  remove(@MessageBody() id: number) {
    return this.sseNotificationsService.remove(id);
  }
}
