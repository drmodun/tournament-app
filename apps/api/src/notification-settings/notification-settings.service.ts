import { Injectable, NotFoundException } from '@nestjs/common';
import { IUpdateNotificationSettingsRequest } from '@tournament-app/types';
import { NotificationSettingsRepository } from './notification-settings.repository';

@Injectable()
export class NotificationSettingsService {
  constructor(private readonly repository: NotificationSettingsRepository) {}

  async getSettings(userId: number) {
    return await this.repository.getOrCreateSettings(userId);
  }

  async updateSettings(
    userId: number,
    settings: IUpdateNotificationSettingsRequest,
  ) {
    return await this.repository.upsertSettings(userId, settings);
  }

  // userIds without the ones that turned in-app notifications off
  async filterInAppRecipients(userIds: number[]) {
    const optedOut = new Set(
      await this.repository.getUsersWithoutInApp(userIds),
    );

    return userIds.filter((userId) => !optedOut.has(userId));
  }

  async getTokens(userId: number) {
    return await this.repository.getTokens(userId);
  }

  async registerToken(userId: number, token: string) {
    return await this.repository.upsertToken(userId, token);
  }

  async removeToken(userId: number, id: number) {
    const removed = await this.repository.deleteToken(userId, id);

    if (!removed.length) {
      throw new NotFoundException('Notification token not found');
    }
  }
}
