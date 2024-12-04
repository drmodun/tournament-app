import { Injectable } from '@nestjs/common';
import { GroupMembershipDrizzleRepository } from './group-membership.repository';
import {
  GroupMembershipQuery,
  GroupMembershipUpdateRequest,
} from './dto/requests.dto';
import {
  BaseGroupMembershipResponseType,
  GroupMembershipResponsesEnum,
  groupRoleEnum,
} from '@tournament-app/types';
import {
  GroupMembershipResponse,
  MinimalMembershipResponse,
} from './dto/responses.dto';

@Injectable()
export class GroupMembershipService {
  constructor(
    private readonly groupMembershipRepository: GroupMembershipDrizzleRepository,
  ) {}

  async create(groupId: number, userId: number) {
    const action = this.groupMembershipRepository.createEntity({
      groupId,
      userId,
    });

    await action;
  }

  async findAll<
    TResponseType extends
      BaseGroupMembershipResponseType = GroupMembershipResponse,
  >(query: GroupMembershipQuery) {
    const results = await this.groupMembershipRepository.getQuery(query);

    return results as TResponseType[];
  }

  async findOne<
    TResponseType extends
      BaseGroupMembershipResponseType = GroupMembershipResponse,
  >(
    groupId: number,
    userId: number,
    responseType: GroupMembershipResponsesEnum = GroupMembershipResponsesEnum.BASE,
  ) {
    const results = await this.groupMembershipRepository.getSingleQuery(
      {
        userId,
        groupId,
      },
      responseType,
    );

    return results[0] as TResponseType;
  }

  //TODO: maybe in future composite queries make the composite objesct paramaters intead of using each
  //one as a function a argument

  async update(
    groupId: number,
    userId: number,
    updateGroupMembershipDto: GroupMembershipUpdateRequest,
  ) {
    const action = this.groupMembershipRepository.updateEntity(
      {
        groupId,
        userId,
      },
      updateGroupMembershipDto,
    );

    await action;
  }

  async remove(groupId: number, userId: number) {
    const action = this.groupMembershipRepository.deleteEntity({
      groupId,
      userId,
    });

    await action;
  }

  async isAdmin(groupId: number, userId: number) {
    const results = await this.findOne<MinimalMembershipResponse>(
      groupId,
      userId,
      GroupMembershipResponsesEnum.MINI,
    );

    return (
      results.role == groupRoleEnum.ADMIN || results.role == groupRoleEnum.OWNER
    );
  }

  async isMember(groupId: number, userId: number) {
    const results = await this.findOne<MinimalMembershipResponse>(
      groupId,
      userId,
      GroupMembershipResponsesEnum.MINI,
    );

    return !!results;
  }

  async isOwner(groupId: number, userId: number) {
    const results = await this.findOne<MinimalMembershipResponse>(
      groupId,
      userId,
      GroupMembershipResponsesEnum.MINI,
    );

    return results.role == groupRoleEnum.OWNER;
  }
}
