import { Module } from '@nestjs/common';
import { BlockedGroupsService } from './blocked-groups.service';
import { BlockedGroupsController } from './blocked-groups.controller';
import { GroupDrizzleRepository } from 'src/group/group.repository';
import { GroupModule } from 'src/group/group.module';

@Module({
  controllers: [BlockedGroupsController],
  providers: [BlockedGroupsService, GroupDrizzleRepository],
  imports: [GroupModule],
})
export class BlockedGroupsModule {}
