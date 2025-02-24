import { Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { GroupDrizzleRepository } from './group.repository';
import { GroupMembershipService } from 'src/group-membership/group-membership.service';
import { GroupMembershipModule } from 'src/group-membership/group-membership.module';
import { GroupAdminGuard } from './guards/group-admin.guard';
import { GroupMemberGuard } from './guards/group-member.guard';
import { GroupOwnerGuard } from './guards/group-owner.guard';

@Module({
  controllers: [GroupController],
  providers: [
    GroupService,
    GroupDrizzleRepository,
    GroupMembershipService,
    GroupAdminGuard,
    GroupMemberGuard,
    GroupOwnerGuard,
  ],
  imports: [GroupMembershipModule],
  exports: [
    GroupService,
    GroupDrizzleRepository,
    GroupAdminGuard,
    GroupMemberGuard,
    GroupOwnerGuard,
    GroupMembershipService,
  ],
})
export class GroupModule {}
