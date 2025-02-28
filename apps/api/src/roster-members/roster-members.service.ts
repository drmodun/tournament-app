import { Injectable } from '@nestjs/common';
import { CreateRosterMemberDto } from './dto/create-roster-member.dto';
import { UpdateRosterMemberDto } from './dto/update-roster-member.dto';

@Injectable()
export class RosterMembersService {
  create(createRosterMemberDto: CreateRosterMemberDto) {
    return 'This action adds a new rosterMember';
  }

  findAll() {
    return `This action returns all rosterMembers`;
  }

  findOne(id: number) {
    return `This action returns a #${id} rosterMember`;
  }

  update(id: number, updateRosterMemberDto: UpdateRosterMemberDto) {
    return `This action updates a #${id} rosterMember`;
  }

  remove(id: number) {
    return `This action removes a #${id} rosterMember`;
  }
}
