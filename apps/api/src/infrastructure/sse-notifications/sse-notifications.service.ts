import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { NotificationQueryDto } from './dto/requests';
import { NotificationCreateDto } from '../types';
import { SseNotificationRepository } from './sse-notification.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationBus } from './notification-bus';
import { JwtService } from '@nestjs/jwt';
import { signSseToken, verifySseToken } from './sse-token';
import { Observable, fromEvent } from 'rxjs';
import { map } from 'rxjs/operators';
import { NotificationSettingsService } from 'src/notification-settings/notification-settings.service';

@Injectable()
export class SseNotificationsService {
  constructor(
    private readonly sseNotificationRepository: SseNotificationRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly notificationBus: NotificationBus,
    private readonly jwtService: JwtService,
    private readonly notificationSettingsService: NotificationSettingsService,
  ) {}

  async findAllForUser(query: NotificationQueryDto) {
    return await this.sseNotificationRepository.getReadTimeSorted(query);
  }

  // Users who turned in-app notifications off neither get the notification stored nor streamed
  async createWithUsers(
    notification: NotificationCreateDto,
    users: number[],
  ): Promise<void> {
    const recipients =
      await this.notificationSettingsService.filterInAppRecipients(users);

    if (!recipients.length) {
      return;
    }

    await this.sseNotificationRepository.createWithUsers(
      notification,
      recipients,
    );

    await this.publishManyNotifications(recipients, notification);
  }

  // A fresh short-lived token for the notification stream
  async requestNewToken(userId: number) {
    return {
      id: userId,
      sseToken: await signSseToken(this.jwtService, userId),
    };
  }

  async getUserIdByToken(token: string) {
    const userId = await verifySseToken(this.jwtService, token);

    if (!userId) {
      throw new UnauthorizedException(
        'The notification token is invalid or has expired',
      );
    }

    return userId;
  }

  public async publishNotification(
    userId: number,
    message: NotificationCreateDto,
  ) {
    try {
      await this.notificationBus.publish(userId, message);
    } catch (error) {
      console.error('Error publishing notification', error);
      throw new BadRequestException(error);
    }
  }

  public async publishManyNotifications(
    userIds: number[],
    message: NotificationCreateDto,
  ) {
    const promises = userIds.map((userId) =>
      this.publishNotification(userId, message),
    );

    return await Promise.all(promises);
  }

  async setAsRead(id: number, userId: number) {
    const updated = await this.sseNotificationRepository.updateToRead(
      id,
      userId,
    );

    if (!updated?.length) {
      throw new NotFoundException('Notification not found');
    }
  }

  async setAllAsReadForUser(userId: number) {
    await this.sseNotificationRepository.updateAllToReadForUser(userId);
  }

  async setBulkAsRead(ids: number[], userId: number) {
    await this.sseNotificationRepository.updateBulkToRead(ids, userId);
  }

  async remove(id: number, userId: number) {
    const removed = await this.sseNotificationRepository.deleteForUser(
      id,
      userId,
    );

    if (!removed?.length) {
      throw new NotFoundException('Notification not found');
    }
  }

  async createNotificationAndLinkToUsers(
    notification: NotificationCreateDto,
    userIds: number[],
  ) {
    const recipients =
      await this.notificationSettingsService.filterInAppRecipients(userIds);

    if (!recipients.length) {
      return;
    }

    await this.sseNotificationRepository.createWithUsers(
      notification,
      recipients,
    );
  }

  async getNotificationStream(
    userId: number,
  ): Promise<Observable<MessageEvent>> {
    return fromEvent(this.eventEmitter, userId.toString()).pipe(
      map((notification: NotificationCreateDto) => {
        return {
          data: notification,
          type: 'notification',
        } as MessageEvent;
      }),
    );
  }
}
