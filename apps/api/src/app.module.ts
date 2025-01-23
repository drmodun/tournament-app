import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { EmailModule } from './infrastructure/email/email.module';
import { BlobModule } from './infrastructure/blob/blob.module';
import { NotificationsModule } from './infrastructure/notifications/notifications.module';
import { AuthModule } from './auth/auth.module';
import { GroupModule } from './group/group.module';
import { GroupMembershipModule } from './group-membership/group-membership.module';
import { FollowersModule } from './followers/followers.module';
import { GroupJoinRequestsModule } from './group-join-requests/group-join-requests.module';
import { GroupInvitesModule } from './group-invites/group-invites.module';
import { CategoryModule } from './category/category.module';
import { TournamentModule } from './tournament/tournament.module';
import { StageModule } from './stage/stage.module';
import { BullModule } from '@nestjs/bullmq';

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
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
