import { Module } from '@nestjs/common';
import { GroupMembershipService } from './group-membership.service';
import { GroupMembershipController } from './group-membership.controller';
import { GroupMembershipDrizzleRepository } from './group-membership.repository';
import { UserDrizzleRepository } from 'src/users/user.repository';
import { GroupDrizzleRepository } from 'src/group/group.repository';

@Module({
  imports: [],
  controllers: [GroupMembershipController],
  providers: [
    GroupMembershipService,
    GroupMembershipDrizzleRepository,
    UserDrizzleRepository,
    GroupDrizzleRepository,
  ],
  exports: [GroupMembershipService],
})
export class GroupMembershipModule {}
