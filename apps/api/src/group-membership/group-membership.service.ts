import { Injectable } from '@nestjs/common';
import { GroupMembershipDrizzleRepository } from './group-membership.repository';

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

    return await action satisfies 
  }

  findAll() {
    return `This action returns all groupMembership`;
  }

  findOne(id: number) {
    return `This action returns a #${id} groupMembership`;
  }

  update(id: number, updateGroupMembershipDto: UpdateGroupMembershipDto) {
    return `This action updates a #${id} groupMembership`;
  }

  remove(id: number) {
    return `This action removes a #${id} groupMembership`;
  }
}
