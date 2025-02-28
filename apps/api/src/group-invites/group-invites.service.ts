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
@Injectable()
export class GroupInvitesService {
  constructor(
    private readonly repository: GroupInviteDrizzleRepository,
    private readonly groupMembershipService: GroupMembershipService,
    private readonly groupService: GroupService,
  ) {}

  async create(groupId: number, userId: number, dto: CreateGroupInviteDto) {
    await this.groupService.checkIfGroupIsReal(groupId);

    await this.checkIfUserIsAlreadyMember(groupId, userId);

    await this.repository.createEntity({
      groupId,
      userId,
      ...dto,
    });
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
  }

  async reject(groupId: number, userId: number) {
    await this.findOne(groupId, userId);

    await this.repository.deleteEntity({ groupId, userId });
  }
}
