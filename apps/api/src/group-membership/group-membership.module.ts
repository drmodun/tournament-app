import { Module } from '@nestjs/common';
import { GroupMembershipService } from './group-membership.service';
import { GroupMembershipController } from './group-membership.controller';
import { GroupMembershipDrizzleRepository } from './group-membership.repository';
import { DrizzleModule } from '../drizzle/drizzle.module';

@Module({
  imports: [DrizzleModule],
  controllers: [GroupMembershipController],
  providers: [GroupMembershipService, GroupMembershipDrizzleRepository],
  exports: [GroupMembershipService],
})
export class GroupMembershipModule {}
