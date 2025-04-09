import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GroupInviteDrizzleRepository } from './group-invites.repository';
import { GroupMembershipService } from '../group-membership/group-membership.service';
import {
  CreateGroupInviteDto,
  UpdateGroupInviteDto,
  GroupInviteQuery,
} from './dto/requests.dto';
import {
  GroupInviteResponse,
  GroupInviteResponsesEnum,
} from '@tournament-app/types';
import { GroupInviteWithUserResponseDto } from './dto/responses.dto';
import { GroupService } from 'src/group/group.service';
import { SseNotificationsService } from '../infrastructure/sse-notifications/sse-notifications.service';
import { NotificationTemplatesFiller } from '../infrastructure/firebase-notifications/templates';
import { TemplatesEnum } from '../infrastructure/types';
import { notificationTypeEnum } from '@tournament-app/types';

@Injectable()
export class GroupInvitesService {
  constructor(
    private readonly repository: GroupInviteDrizzleRepository,
    private readonly groupMembershipService: GroupMembershipService,
    private readonly groupService: GroupService,
    private readonly sseNotificationsService: SseNotificationsService,
    private readonly templatesFiller: NotificationTemplatesFiller,
  ) {}

  async create(groupId: number, userId: number, dto: CreateGroupInviteDto) {
    await this.groupService.checkIfGroupIsReal(groupId);

    await this.checkIfUserIsAlreadyMember(groupId, userId);

    await this.repository.createEntity({
      groupId,
      userId,
      ...dto,
    });

    await this.sendNotificationToInvitedUser(groupId, userId);
  }

  async sendNotificationToInvitedUser(groupId: number, userId: number) {
    const group = await this.groupService.findOne(groupId);

    const message = this.templatesFiller.fill(TemplatesEnum.GROUP_INVITATION, {
      group: group.name,
    });

    await this.sseNotificationsService.createWithUsers(
      {
        type: notificationTypeEnum.GROUP_INVITATION,
        message,
        link: `/manageGroupInvites`,
        image: null,
      },
      [userId],
    );
  }

  async checkIfUserIsAlreadyMember(groupId: number, userId: number) {
    const exists = await this.groupMembershipService.entityExists(
      groupId,
      userId,
    );

    if (exists) {
      throw new BadRequestException('User is already a member of this group');
    }
  }

  async checkIfInviteExists(groupId: number, userId: number) {
    const exists = await this.repository.getSingleQuery({
      userId,
      groupId,
    });

    if (exists.length > 0) {
      throw new BadRequestException('Invite already exists');
    }
  }

  async findAll<
    TResponseType extends GroupInviteResponse = GroupInviteWithUserResponseDto,
  >(query: GroupInviteQuery): Promise<TResponseType[]> {
    const results = await this.repository.getQuery(query);

    return results as TResponseType[];
  }

  async findOne<
    TResponseType extends GroupInviteResponse = GroupInviteWithUserResponseDto,
  >(
    groupId: number,
    userId: number,
    responseType: GroupInviteResponsesEnum = GroupInviteResponsesEnum.WITH_USER,
  ) {
    const invite = await this.repository.getSingleQuery(
      {
        userId,
        groupId,
      },
      responseType,
    );

    if (!invite.length) {
      throw new NotFoundException('Invite not found');
    }

    return invite[0] as TResponseType;
  }

  async update(groupId: number, userId: number, dto: UpdateGroupInviteDto) {
    const action = this.repository.updateEntity(
      {
        userId,
        groupId,
      },
      dto,
    );

    await action;
  }

  async remove(groupId: number, userId: number) {
    await this.repository.deleteEntity({ groupId, userId });
  }

  async accept(groupId: number, userId: number) {
    await this.findOne(groupId, userId);

    await this.groupMembershipService.create(groupId, userId);
    await this.remove(groupId, userId);

    await this.sendNotificationAboutAcceptance(groupId, userId);
  }

  async sendNotificationAboutRejection(groupId: number, userId: number) {
    const group = await this.groupService.findOne(groupId);

    const message = this.templatesFiller.fill(
      TemplatesEnum.GROUP_JOIN_REJECTION,
      {
        group: group.name,
      },
    );

    await this.sseNotificationsService.createWithUsers(
      {
        type: notificationTypeEnum.GROUP_JOIN_REJECTION,
        message,
        image: null,
      },
      [userId],
    );
  }

  async sendNotificationAboutAcceptance(groupId: number, userId: number) {
    const group = await this.groupService.findOne(groupId);

    const message = this.templatesFiller.fill(
      TemplatesEnum.GROUP_JOIN_APPROVAL,
      {
        group: group.name,
      },
    );

    await this.sseNotificationsService.createWithUsers(
      {
        type: notificationTypeEnum.GROUP_JOIN_APPROVAL,
        message,
        link: `/group/${groupId}`,
        image: null,
      },
      [userId],
    );
  }

  async reject(groupId: number, userId: number) {
    await this.findOne(groupId, userId);

    await this.repository.deleteEntity({ groupId, userId });
    await this.sendNotificationAboutRejection(groupId, userId);
  }
}
