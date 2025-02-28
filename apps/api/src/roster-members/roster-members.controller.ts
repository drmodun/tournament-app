import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RosterMembersService } from './roster-members.service';
import { CreateRosterMemberDto } from './dto/create-roster-member.dto';
import { UpdateRosterMemberDto } from './dto/update-roster-member.dto';

@Controller('roster-members')
export class RosterMembersController {
  constructor(private readonly rosterMembersService: RosterMembersService) {}

  @Post()
  create(@Body() createRosterMemberDto: CreateRosterMemberDto) {
    return this.rosterMembersService.create(createRosterMemberDto);
  }

  @Get()
  findAll() {
    return this.rosterMembersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rosterMembersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRosterMemberDto: UpdateRosterMemberDto) {
    return this.rosterMembersService.update(+id, updateRosterMemberDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rosterMembersService.remove(+id);
  }
}
