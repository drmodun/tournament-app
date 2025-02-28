import { Module } from '@nestjs/common';
import { RosterMembersService } from './roster-members.service';
import { RosterMembersController } from './roster-members.controller';

@Module({
  controllers: [RosterMembersController],
  providers: [RosterMembersService],
})
export class RosterMembersModule {}
