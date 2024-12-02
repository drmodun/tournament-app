import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { GroupResponsesEnum } from '@tournament-app/types';
import { GroupDrizzleRepository } from './group.repository';
import {
  CreateGroupRequest,
  UpdateGroupRequest,
  GroupQuery,
} from './dto/requests.dto';
import { IGroupResponse } from '@tournament-app/types';
import { AnyGroupReturnType, GroupReturnTypesEnumType } from './types';

@Injectable()
export class GroupService {
  constructor(private readonly repository: GroupDrizzleRepository) {}

  async create(createGroupDto: CreateGroupRequest, userId: number) {
    const action = await this.repository.createEntity({
      ...createGroupDto,
      userId,
    });

    if (!action[0]) {
      throw new UnprocessableEntityException('Group creation failed');
    }

    return action[0];
  }

  async findAll<TResponseType extends AnyGroupReturnType>(query: GroupQuery) {
    const queryFunction = this.repository.getQuery(query);
    const results = await queryFunction;

    return results as TResponseType[];
  }

  async findOne<TResponseType extends AnyGroupReturnType = IGroupResponse>(
    id: number,
    responseType: GroupReturnTypesEnumType = GroupResponsesEnum.BASE,
  ) {
    const results = await this.repository.getSingleQuery(id, responseType);

    if (results.length === 0) {
      throw new NotFoundException('Group not found');
    }

    return results[0] as TResponseType;
  }

  async update(id: number, updateGroupDto: UpdateGroupRequest) {
    const action = await this.repository.updateEntity(id, updateGroupDto);

    if (!action[0]) {
      throw new NotFoundException(
        'Group update failed or user is not an admin',
      );
    }

    return action[0];
  }

  async remove(id: number) {
    const action = await this.repository.deleteEntity(id);

    if (!action[0]) {
      throw new NotFoundException(
        'Group removal failed or user is not an admin',
      );
    }

    return action[0];
  }
}
