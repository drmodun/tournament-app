import { Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { GroupDrizzleRepository } from './group.repository';
import { GroupMembershipService } from 'src/group-membership/group-membership.service';
import { GroupMembershipModule } from 'src/group-membership/group-membership.module';

@Module({
  controllers: [GroupController],
  providers: [GroupService, GroupDrizzleRepository, GroupMembershipService],
  exports: [GroupService, GroupDrizzleRepository],
  imports: [GroupMembershipModule],
})
export class GroupModule {}
