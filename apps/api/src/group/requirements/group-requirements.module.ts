import { GroupRequirementsController } from './group-requirements.controller';
import { GroupRequirementsService } from './group-requirements.service';
import { GroupRequirementsRepository } from './group-requirements.repository';
import { Module } from '@nestjs/common';
import { GroupModule } from '../group.module';

@Module({
  controllers: [GroupRequirementsController],
  providers: [GroupRequirementsService, GroupRequirementsRepository],
  exports: [GroupRequirementsService],
  imports: [GroupModule],
})
export class GroupRequirementsModule {}
