import { Module } from '@nestjs/common';
import { GroupInterestsController } from './group-interests.controller';
import { GroupInterestsService } from './group-interests.service';
import { GroupDrizzleRepository } from '../group.repository';
import { GroupAdminGuard } from '../guards/group-admin.guard';
import { GroupModule } from '../group.module';

@Module({
  controllers: [GroupInterestsController],
  providers: [GroupInterestsService, GroupDrizzleRepository, GroupAdminGuard],
  imports: [GroupModule],
})
export class GroupInterestsModule {}
