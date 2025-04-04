import { Injectable } from '@nestjs/common';
import { SseNotificationsService } from './sse-notifications.service';
import { NotificationTemplatesFiller } from '../firebase-notifications/templates';
import { TemplatesEnum } from '../types';
import { notificationTypeEnum } from '@tournament-app/types';

@Injectable()
export class NotificationTriggersService {
  constructor(
    private readonly sseNotificationsService: SseNotificationsService,
    private readonly templatesFiller: NotificationTemplatesFiller,
  ) {}

  async sendGroupInvitationNotification(
    userId: number,
    groupId: number,
    groupName: string,
  ): Promise<void> {
    const message = this.templatesFiller.fill(TemplatesEnum.GROUP_INVITATION, {
      group: groupName,
    });

    await this.sseNotificationsService.createWithUsers(
      {
        type: notificationTypeEnum.GROUP_INVITATION,
        message,
        link: `/groups/${groupId}/invites`,
        image: null,
      },
      [userId],
    );
  }

  async sendGroupAdminPromotionNotification(
    userId: number,
    groupId: number,
    groupName: string,
  ): Promise<void> {
    const message = this.templatesFiller.fill(
      TemplatesEnum.GROUP_ADMIN_PROMOTION,
      {
        group: groupName,
      },
    );

    await this.sseNotificationsService.createWithUsers(
      {
        type: notificationTypeEnum.GROUP_ADMIN_PROMOTION,
        message,
        link: `/groups/${groupId}`,
        image: null,
      },
      [userId],
    );
  }

  async sendGroupJoinRequestNotification(
    adminIds: number[],
    groupId: number,
    groupName: string,
    username: string,
  ): Promise<void> {
    const message = this.templatesFiller.fill(
      TemplatesEnum.GROUP_JOIN_REQUEST,
      {
        group: groupName,
        username,
      },
    );

    await this.sseNotificationsService.createWithUsers(
      {
        type: notificationTypeEnum.GROUP_JOIN_REQUEST,
        message,
        link: `/groups/${groupId}/join-requests`,
        image: null,
      },
      adminIds,
    );
  }

  async sendGroupJoinApprovalNotification(
    userId: number,
    groupId: number,
    groupName: string,
  ): Promise<void> {
    const message = this.templatesFiller.fill(
      TemplatesEnum.GROUP_JOIN_APPROVAL,
      {
        group: groupName,
      },
    );

    await this.sseNotificationsService.createWithUsers(
      {
        type: notificationTypeEnum.GROUP_JOIN_APPROVAL,
        message,
        link: `/groups/${groupId}`,
        image: null,
      },
      [userId],
    );
  }

  async sendGroupJoinRejectionNotification(
    userId: number,
    groupId: number,
    groupName: string,
  ): Promise<void> {
    const message = this.templatesFiller.fill(
      TemplatesEnum.GROUP_JOIN_REJECTION,
      {
        group: groupName,
      },
    );

    await this.sseNotificationsService.createWithUsers(
      {
        type: notificationTypeEnum.GROUP_JOIN_REJECTION,
        message,
        link: `/groups`,
        image: null,
      },
      [userId],
    );
  }
}
