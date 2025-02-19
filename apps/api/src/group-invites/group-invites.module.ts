import { Module } from '@nestjs/common';
import { GroupInvitesService } from './group-invites.service';
import { GroupInvitesController } from './group-invites.controller';
import { GroupInviteDrizzleRepository } from './group-invites.repository';
import { GroupMembershipModule } from '../group-membership/group-membership.module';
import { GroupModule } from '../group/group.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [GroupMembershipModule, GroupModule, UsersModule],
  controllers: [GroupInvitesController],
  providers: [GroupInvitesService, GroupInviteDrizzleRepository],
  exports: [GroupInvitesService],
})
export class GroupInvitesModule {}
