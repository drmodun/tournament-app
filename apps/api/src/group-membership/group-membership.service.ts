import { Injectable } from '@nestjs/common';
import { CreateGroupMembershipDto } from './dto/create-group-membership.dto';
import { UpdateGroupMembershipDto } from './dto/update-group-membership.dto';

@Injectable()
export class GroupMembershipService {
  create(createGroupMembershipDto: CreateGroupMembershipDto) {
    return 'This action adds a new groupMembership';
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
