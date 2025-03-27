import { Injectable, NotFoundException } from '@nestjs/common';
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
import { GroupMembershipResponse } from './dto/responses.dto';
import { PaginationOnly } from 'src/base/query/baseQuery';

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
  >(query: GroupMembershipQuery): Promise<TResponseType[]> {
    const results = await this.groupMembershipRepository.getQuery(query);

    return results as TResponseType[];
  }

  async autoComplete(
    groupId: number,
    search: string,
    { pageSize = 10, page = 1 }: PaginationOnly,
  ) {
    return await this.groupMembershipRepository.autoComplete(search, groupId, {
      pageSize,
      page,
    });
  }

  async findOne<
    TResponseType extends
      BaseGroupMembershipResponseType = GroupMembershipResponse,
  >(
    groupId: number,
    userId: number,
    responseType: GroupMembershipResponsesEnum = GroupMembershipResponsesEnum.BASE,
  ): Promise<TResponseType> {
    const results = await this.groupMembershipRepository.getSingleQuery(
      {
        userId,
        groupId,
      },
      responseType,
    );

    if (results.length === 0) {
      throw new NotFoundException('Group membership not found');
    }

    return results[0] as TResponseType;
  }

  async autoCompleteGroups(
    search: string,
    userId: number,
    { pageSize = 10, page = 1 }: PaginationOnly,
  ) {
    return await this.groupMembershipRepository.autoCompleteGroups(
      search,
      userId,
      { pageSize, page },
    );
  }

  async findOneWithoutThrow(
    groupId: number,
    userId: number,
    responseType: GroupMembershipResponsesEnum = GroupMembershipResponsesEnum.BASE,
  ): Promise<GroupMembershipResponse | null> {
    const results = await this.groupMembershipRepository.getSingleQuery(
      {
        userId,
        groupId,
      },
      responseType,
    );

    return results[0] || null;
  }

  async update(
    groupId: number,
    userId: number,
    updateGroupMembershipDto: GroupMembershipUpdateRequest,
  ): Promise<void> {
    if (!(await this.entityExists(groupId, userId))) {
      throw new NotFoundException('Group membership not found');
    }

    const action = this.groupMembershipRepository.updateEntity(
      {
        groupId,
        userId,
      },
      updateGroupMembershipDto,
    );

    await action;
  }

  async entityExists(groupId: number, userId: number): Promise<boolean> {
    const results = await this.groupMembershipRepository.getSingleQuery({
      groupId,
      userId,
    });

    return results.length > 0;
  }

  async remove(groupId: number, userId: number): Promise<void> {
    if (!(await this.entityExists(groupId, userId))) {
      throw new NotFoundException('Group membership not found');
    }

    await this.groupMembershipRepository.deleteEntity({
      groupId,
      userId,
    });
  }

  async isAdmin(groupId: number, userId: number): Promise<boolean> {
    const results = await this.findOneWithoutThrow(
      groupId,
      userId,
      GroupMembershipResponsesEnum.MINI,
    );

    return (
      results?.role == groupRoleEnum.ADMIN ||
      results?.role == groupRoleEnum.OWNER
    );
  }

  async isMember(groupId: number, userId: number): Promise<boolean> {
    const results = await this.findOneWithoutThrow(
      groupId,
      userId,
      GroupMembershipResponsesEnum.MINI,
    );

    return !!results;
  }

  async getAllAdmins(groupId: number) {
    return await this.groupMembershipRepository.getUnpaginatedUsersInfoOnly({
      groupId,
      role: groupRoleEnum.ADMIN,
    });
  }

  async isOwner(groupId: number, userId: number): Promise<boolean> {
    const results = await this.findOneWithoutThrow(
      groupId,
      userId,
      GroupMembershipResponsesEnum.MINI,
    );

    return results?.role == groupRoleEnum.OWNER;
  }
}
