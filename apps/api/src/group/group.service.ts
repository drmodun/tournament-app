import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  GroupMembershipResponsesEnum,
  GroupResponsesEnum,
} from '@tournament-app/types';
import { GroupDrizzleRepository } from './group.repository';
import {
  CreateGroupRequest,
  UpdateGroupRequest,
  GroupQuery,
} from './dto/requests.dto';
import { IGroupResponse } from '@tournament-app/types';
import { AnyGroupReturnType, GroupReturnTypesEnumType } from './types';
import { GroupMembershipService } from '../group-membership/group-membership.service';

@Injectable()
export class GroupService {
  constructor(
    private readonly repository: GroupDrizzleRepository,
    private readonly groupMembershipService: GroupMembershipService,
  ) {}

  async create(createGroupDto: CreateGroupRequest, userId: number) {
    const action = await this.repository.createEntityWithUser({
      ...createGroupDto,
      userId,
    });

    if (!action[0]) {
      throw new UnprocessableEntityException('Group creation failed');
    }

    return this.findOne(action[0].id);
  }

  async findAll<TResponseType extends AnyGroupReturnType>(
    query: GroupQuery,
  ): Promise<TResponseType[]> {
    const { responseType = GroupResponsesEnum.BASE, ...queryParams } = query;
    const queryFunction = this.repository.getQuery({
      ...queryParams,
      responseType,
    });

    const results = await queryFunction;
    return results as TResponseType[];
  }

  async findOne<TResponseType extends AnyGroupReturnType = IGroupResponse>(
    id: number,
    responseType: GroupReturnTypesEnumType = GroupResponsesEnum.BASE,
  ): Promise<TResponseType> {
    const results = await this.repository.getSingleQuery(id, responseType);

    if (results.length === 0) {
      throw new NotFoundException(`Group with id ${id} not found`);
    }

    return results[0] as TResponseType;
  }

  async update(id: number, updateGroupDto: UpdateGroupRequest) {
    // First check if group exists
    await this.findOne(id);

    const action = await this.repository.updateEntity(id, updateGroupDto);

    if (!action[0]) {
      throw new UnprocessableEntityException(
        'Group update failed - check if you have admin permissions',
      );
    }

    return this.findOne(id);
  }

  async remove(id: number) {
    // First check if group exists
    await this.findOne(id);

    const action = await this.repository.deleteEntity(id);

    if (!action[0]) {
      throw new UnprocessableEntityException(
        'Group removal failed - check if you have admin permissions',
      );
    }

    return { success: true, id };
  }

  async getGroupMembers(id: number) {
    const group = await this.findOne(id);
    const members = await this.groupMembershipService.findAll({
      groupId: id,
      responseType: GroupMembershipResponsesEnum.USER_WITH_DATES,
    });

    return {
      group,
      members,
    };
  }

  async getGroupTournaments(id: number) {
    const group = await this.findOne(id);
    const tournaments = await this.repository.getGroupTournaments(id);
    return {
      group,
      tournaments,
    };
  } //TODO. remove this when those entities are created

  async getGroupFollowers(id: number) {
    const group = await this.findOne(id);
    const followers = await this.repository.getGroupFollowers(id);
    return {
      group,
      followers,
    };
  }
}
