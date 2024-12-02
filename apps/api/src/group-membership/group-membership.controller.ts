import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { GroupMembershipService } from './group-membership.service';
import { CreateGroupMembershipDto } from './dto/create-group-membership.dto';
import { UpdateGroupMembershipDto } from './dto/update-group-membership.dto';

@Controller('group-membership')
export class GroupMembershipController {
  constructor(private readonly groupMembershipService: GroupMembershipService) {}

  @Post()
  create(@Body() createGroupMembershipDto: CreateGroupMembershipDto) {
    return this.groupMembershipService.create(createGroupMembershipDto);
  }

  @Get()
  findAll() {
    return this.groupMembershipService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.groupMembershipService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGroupMembershipDto: UpdateGroupMembershipDto) {
    return this.groupMembershipService.update(+id, updateGroupMembershipDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.groupMembershipService.remove(+id);
  }
}
