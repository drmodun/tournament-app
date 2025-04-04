import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GroupJoinRequestDrizzleRepository } from './group-join-requests.repository';
import {
  GroupJoinRequestQuery,
  CreateGroupJoinRequestDto,
  UpdateGroupJoinRequestDto,
} from './dto/requests.dto';
import {
  BaseGroupJoinRequestResponseType,
  GroupJoinRequestResponsesEnum,
  groupTypeEnum,
  IGroupJoinRequestForNotification,
  notificationTypeEnum,
} from '@tournament-app/types';
import { GroupJoinRequestWithUserResponse } from './dto/responses.dto';
import { GroupMembershipService } from '../group-membership/group-membership.service';
import { GroupService } from 'src/group/group.service';
import { NotificationTemplatesFiller } from 'src/infrastructure/firebase-notifications/templates';
import { NotificationCreateDto, TemplatesEnum } from 'src/infrastructure/types';
import { SseNotificationsService } from 'src/infrastructure/sse-notifications/sse-notifications.service';

@Injectable()
export class GroupJoinRequestsService {
  constructor(
    private readonly groupJoinRequestRepository: GroupJoinRequestDrizzleRepository,
    private readonly groupMembershipService: GroupMembershipService,
    private readonly notificationTemplateFiller: NotificationTemplatesFiller,
    private readonly notificationService: SseNotificationsService,
    private readonly groupService: GroupService,
  ) {}

  async create(
    groupId: number,
    userId: number,
    createDto: CreateGroupJoinRequestDto,
  ) {
    await this.checkIfGroupIsPublic(groupId, createDto.relatedLFPId);

    const action = this.groupJoinRequestRepository.createEntity({
      groupId,
      userId,
      message: createDto.message,
      relatedLFPId: createDto.relatedLFPId,
    });

    await action;

    await this.saveAndEmitNotificationsForNewRequest(groupId, userId);
  }

  async checkIfGroupIsPublic(groupId: number, relatedLFPId?: number) {
    const group = await this.groupService.findOne(groupId);

    if (group.type == groupTypeEnum.PUBLIC) {
      return;
    }

    if (group.type == groupTypeEnum.PRIVATE) {
      console.log(relatedLFPId);

      throw new BadRequestException(
        'You cannot create a group join request for a private group',
      );
    } else {
      throw new BadRequestException('You cannot join a fake group');
    }
  }

  async findAll<
    TResponseType extends
      BaseGroupJoinRequestResponseType = GroupJoinRequestWithUserResponse,
  >(query: GroupJoinRequestQuery): Promise<TResponseType[]> {
    const results = await this.groupJoinRequestRepository.getQuery(query);
    return results as TResponseType[];
  }

  async findOne<
    TResponseType extends
      BaseGroupJoinRequestResponseType = GroupJoinRequestWithUserResponse,
  >(
    groupId: number,
    userId: number,
    responseType: GroupJoinRequestResponsesEnum = GroupJoinRequestResponsesEnum.WITH_USER,
  ): Promise<TResponseType> {
    const results = await this.groupJoinRequestRepository.getSingleQuery(
      {
        userId,
        groupId,
      },
      responseType,
    );

    if (!results.length) {
      throw new NotFoundException(
        `Group join request with groupId ${groupId} and userId ${userId} not found`,
      );
    }

    return results[0] as TResponseType;
  }

  async update(
    groupId: number,
    userId: number,
    updateDto: UpdateGroupJoinRequestDto,
  ) {
    const action = this.groupJoinRequestRepository.updateEntity(
      {
        userId,
        groupId,
      },
      updateDto,
    );

    await action;
  }

  async remove(groupId: number, userId: number) {
    const action = this.groupJoinRequestRepository.deleteEntity({
      userId,
      groupId,
    });

    await action;
  }

  async exists(groupId: number, userId: number): Promise<boolean> {
    const results = await this.groupJoinRequestRepository.getSingleQuery({
      groupId,
      userId,
    });

    return results?.length > 0;
  }

  async accept(groupId: number, userId: number) {
    const exists = await this.exists(groupId, userId);

    if (!exists) {
      throw new BadRequestException('Group join request not found');
    }

    await this.groupMembershipService.create(groupId, userId);

    await this.remove(groupId, userId);

    const notification = await this.createNotificationBodyForApprovedJoin(
      groupId,
      userId,
    );

    await this.notificationService.createWithUsers(notification, [userId]);
  }

  async getDataForNotification(groupId: number, userId: number) {
    const neededInformation =
      await this.findOne<IGroupJoinRequestForNotification>(
        groupId,
        userId,
        GroupJoinRequestResponsesEnum.FOR_NOTIFICATION,
      );

    return neededInformation;
  }

  async createNotificationBodyForApprovedJoin(groupId: number, userId: number) {
    const information = await this.getDataForNotification(groupId, userId);

    const notificationDto: NotificationCreateDto = {
      type: notificationTypeEnum.GROUP_JOIN_APPROVAL,
      message: this.notificationTemplateFiller.fill(
        TemplatesEnum.GROUP_JOIN_APPROVAL,
        {
          username: information.user?.username,
          group: information.group?.name,
        },
      ),
      image: information.group?.logo,
      link: `/group/${groupId}`,
    };

    return notificationDto;
  }

  async saveAndEmitNotificationsForNewRequest(groupId: number, userId: number) {
    const notification = await this.createNotificationBodyForNewRequest(
      groupId,
      userId,
    );

    const admins = await this.groupMembershipService.getAllAdmins(groupId);

    await this.notificationService.createWithUsers(
      notification,
      admins.map((a) => a.id),
    );
  }

  async createNotificationBodyForRejectedJoin(groupId: number, userId: number) {
    const information = await this.getDataForNotification(groupId, userId);

    const notificationDto: NotificationCreateDto = {
      type: notificationTypeEnum.GROUP_JOIN_REJECTION,
      message: this.notificationTemplateFiller.fill(
        TemplatesEnum.GROUP_JOIN_REJECTION,
        {
          username: information.user?.username,
          group: information.group?.name,
        },
      ),
      image: information.group?.logo,
      link: `/group/${groupId}`,
    };

    return notificationDto;
  }

  async createNotificationBodyForNewRequest(groupId: number, userId: number) {
    const information = await this.getDataForNotification(groupId, userId);

    const notificationDto: NotificationCreateDto = {
      type: notificationTypeEnum.GROUP_JOIN_REQUEST,
      message: this.notificationTemplateFiller.fill(
        TemplatesEnum.GROUP_JOIN_REQUEST,
        {
          username: information.user?.username,
          group: information.group?.name,
        },
      ),
      image: information.group?.logo,
      link: `/user/${userId}`,
    };

    return notificationDto;
  }

  async reject(groupId: number, userId: number) {
    const exists = await this.exists(groupId, userId);

    if (!exists) {
      throw new NotFoundException('Group join request not found');
    }

    const notification = await this.createNotificationBodyForRejectedJoin(
      groupId,
      userId,
    );

    await this.remove(groupId, userId);

    await this.notificationService.createWithUsers(notification, [userId]);
  }
}
