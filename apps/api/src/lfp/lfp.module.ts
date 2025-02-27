import { Module } from '@nestjs/common';
import { LFPController } from './lfp.controller';
import { LFPService } from './lfp.service';
import { LFPDrizzleRepository } from './lfp.repository';
import { GroupModule } from '../group/group.module';
import { CategoryModule } from '../category/category.module';
import { LocationModule } from '../location/location.module';
import { GroupMembershipModule } from 'src/group-membership/group-membership.module';
@Module({
  imports: [GroupModule, CategoryModule, LocationModule],
  controllers: [LFPController],
  providers: [LFPService, LFPDrizzleRepository],
  exports: [LFPService, LFPDrizzleRepository],
})
export class LFPModule {}
