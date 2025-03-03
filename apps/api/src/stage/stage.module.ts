import { Module } from '@nestjs/common';
import { StageService } from './stage.service';
import { StageController } from './stage.controller';
import { StageDrizzleRepository } from './stage.repository';
import { TournamentModule } from 'src/tournament/tournament.module';
import { GroupMembershipModule } from 'src/group-membership/group-membership.module';
import { ChallongeModule } from 'src/challonge/challonge.module';

@Module({
  controllers: [StageController],
  providers: [StageService, StageDrizzleRepository],
  exports: [StageService, StageDrizzleRepository],
  imports: [TournamentModule, GroupMembershipModule, ChallongeModule],
})
export class StageModule {}
