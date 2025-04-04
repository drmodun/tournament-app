import { Injectable, NotFoundException } from '@nestjs/common';
import { FollowerDrizzleRepository } from './followers.repository';
import { FollowerQuery } from './dto/request.dto';
import { FollowerResponse } from './dto/responses.dto';
import {
  FollowerResponsesEnum,
  notificationTypeEnum,
} from '@tournament-app/types';
import { PaginationOnly } from 'src/base/query/baseQuery';
import { SseNotificationsService } from 'src/infrastructure/sse-notifications/sse-notifications.service';
import { NotificationTemplatesFiller } from 'src/infrastructure/firebase-notifications/templates';
import { TemplatesEnum } from 'src/infrastructure/types';

@Injectable()
export class FollowersService {
  constructor(
    private readonly followerRepository: FollowerDrizzleRepository,
    private readonly notificationService: SseNotificationsService,
    private readonly notificationTemplatesFiller: NotificationTemplatesFiller,
  ) {}

  async create(userId: number, followerId: number) {
    if (userId === followerId) {
      throw new NotFoundException('Cannot follow yourself');
    }

    await this.followerRepository.createEntity({
      userId,
      followerId,
    });

    await this.saveAndEmitNotificationsForNewFollower(userId, followerId);
  }

  async findAll<TResponseType extends FollowerResponse = FollowerResponse>(
    query: FollowerQuery,
  ): Promise<TResponseType[]> {
    const results = await this.followerRepository.getQuery(query);
    return results as TResponseType[];
  }

  async findOne(userId: number, followerId: number): Promise<FollowerResponse> {
    const results = await this.followerRepository.getSingleQuery(
      {
        userId,
        followerId,
      },
      FollowerResponsesEnum.FOLLOWER_MINI,
    );

    if (results.length === 0) {
      throw new NotFoundException('Follower relationship not found');
    }

    return results[0] as FollowerResponse;
  }

  async remove(userId: number, followerId: number): Promise<void> {
    const exists = await this.entityExists(userId, followerId);
    if (!exists) {
      throw new NotFoundException('Follower relationship not found');
    }

    await this.followerRepository.deleteEntity({
      userId,
      followerId,
    });
  }

  async entityExists(userId: number, followerId: number): Promise<boolean> {
    const results = await this.followerRepository.getSingleQuery({
      userId,
      followerId,
    });

    return results.length > 0;
  }

  async autoCompleteFollowers(
    search: string,
    userId: number,
    { pageSize = 10, page = 1 }: PaginationOnly,
  ) {
    return await this.followerRepository.autoCompleteFollowers(search, userId, {
      pageSize,
      page,
    });
  }

  async autoCompleteFollowing(
    search: string,
    userId: number,
    { pageSize = 10, page = 1 }: PaginationOnly,
  ) {
    return await this.followerRepository.autoCompleteFollowing(search, userId, {
      pageSize,
      page,
    });
  }

  async createNotificationBodyForNewFollower(
    userId: number,
    followerId: number,
  ) {
    const follower = await this.findOne(userId, followerId);
    const notification = {
      type: notificationTypeEnum.NEW_FOLLOWER,
      message: this.notificationTemplatesFiller.fill(
        TemplatesEnum.NEW_FOLLOWER,
        {
          follower: follower.username,
        },
      ),
      link: `/user/${followerId}`,
      image: follower.profilePicture,
    };

    return notification;
  }

  async saveAndEmitNotificationsForNewFollower(
    userId: number,
    followerId: number,
  ) {
    const notification = await this.createNotificationBodyForNewFollower(
      userId,
      followerId,
    );

    await this.notificationService.createWithUsers(notification, [userId]);
  }
}
