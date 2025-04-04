import { forwardRef, Module } from '@nestjs/common';
import { StageService } from './stage.service';
import { StageController } from './stage.controller';
import { StageDrizzleRepository } from './stage.repository';
import { TournamentModule } from 'src/tournament/tournament.module';
import { GroupMembershipModule } from 'src/group-membership/group-membership.module';
import { ChallongeModule } from 'src/challonge/challonge.module';
import { RosterModule } from 'src/roster/roster.module';
import { StageAdminGuard } from './guards/stage-admin.guard';
import { SseNotificationsModule } from 'src/infrastructure/sse-notifications/sse-notifications.module';
import { NotificationTemplatesFiller } from 'src/infrastructure/firebase-notifications/templates';
import { MatchesModule } from 'src/matches/matches.module';

@Module({
  controllers: [StageController],
  providers: [
    StageService,
    StageDrizzleRepository,
    StageAdminGuard,
    NotificationTemplatesFiller,
  ],
  exports: [StageService, StageDrizzleRepository],
  imports: [
    TournamentModule,
    GroupMembershipModule,
    ChallongeModule,
    forwardRef(() => RosterModule),
    forwardRef(() => MatchesModule),
    SseNotificationsModule,
  ],
})
export class StageModule {}
