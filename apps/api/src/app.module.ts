import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { EmailModule } from './infrastructure/email/email.module';
import { BlobModule } from './infrastructure/blob/blob.module';
import { NotificationsModule } from './infrastructure/firebase-notifications/notifications.module';
import { AuthModule } from './auth/auth.module';
import { GroupModule } from './group/group.module';
import { GroupMembershipModule } from './group-membership/group-membership.module';
import { FollowersModule } from './followers/followers.module';
import { GroupJoinRequestsModule } from './group-join-requests/group-join-requests.module';
import { GroupInvitesModule } from './group-invites/group-invites.module';
import { CategoryModule } from './category/category.module';
import { TournamentModule } from './tournament/tournament.module';
import { StageModule } from './stage/stage.module';
import { ParticipationModule } from './participation/participation.module';
import { BlockedGroupsModule } from './blocked-groups/blocked-groups.module';
import { BlockedUsersModule } from './group/blocked-users/blocked-users.module';
import { LfgModule } from './lfg/lfg.module';
import { InterestModule } from './interest/interest.module';
import { GroupInterestsModule } from './group/group-interests/group-interests.module';
import { LocationModule } from './location/location.module';
import { GroupRequirementsModule } from './group/requirements/group-requirements.module';
import { LFPModule } from './lfp/lfp.module';
import { RosterModule } from './roster/roster.module';
import { CareerModule } from './career/career.module';
import { ChallongeModule } from './challonge/challonge.module';
import { MatchesModule } from './matches/matches.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { QuizModule } from './quiz/quiz.module';
import { QuizAttemptModule } from './quiz-attempt/quiz-attempt.module';

@Module({
  imports: [
    UsersModule,
    EmailModule,
    BlobModule,
    NotificationsModule,
    AuthModule,
    GroupModule,
    GroupMembershipModule,
    FollowersModule,
    GroupJoinRequestsModule,
    GroupInvitesModule,
    CategoryModule,
    TournamentModule,
    StageModule,
    ParticipationModule,
    BlockedGroupsModule,
    BlockedUsersModule,
    LfgModule,
    InterestModule,
    GroupInterestsModule,
    LFPModule,
    LocationModule,
    GroupRequirementsModule,
    RosterModule,
    CareerModule,
    ChallongeModule,
    MatchesModule,
    QuizModule,
    QuizAttemptModule,
    EventEmitterModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
