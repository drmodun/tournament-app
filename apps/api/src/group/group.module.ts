import { Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { GroupDrizzleRepository } from './group.repository';

@Module({
  controllers: [GroupController],
  providers: [GroupService, GroupDrizzleRepository],
  exports: [GroupService],
})
export class GroupModule {}
