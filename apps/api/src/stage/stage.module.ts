import { Module } from '@nestjs/common';
import { StageService } from './stage.service';
import { StageController } from './stage.controller';
import { StageDrizzleRepository } from './stage.repository';
import { TournamentModule } from 'src/tournament/tournament.module';
import { GroupMembershipModule } from 'src/group-membership/group-membership.module';
import { ChallongeModule } from 'src/challonge/challonge.module';
import { StageAdminGuard } from './guards/stage-admin.guard';

@Module({
  controllers: [StageController],
  providers: [StageService, StageDrizzleRepository, StageAdminGuard],
  exports: [StageService, StageDrizzleRepository],
  imports: [TournamentModule, GroupMembershipModule, ChallongeModule],
})
export class StageModule {}
