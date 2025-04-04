import { Module } from '@nestjs/common';
import { GroupInvitesService } from './group-invites.service';
import { GroupInvitesController } from './group-invites.controller';
import { GroupInviteDrizzleRepository } from './group-invites.repository';
import { GroupMembershipModule } from '../group-membership/group-membership.module';
import { GroupModule } from '../group/group.module';
import { UsersModule } from 'src/users/users.module';
import { SseNotificationsModule } from 'src/infrastructure/sse-notifications/sse-notifications.module';
import { SseNotificationRepository } from 'src/infrastructure/sse-notifications/sse-notification.repository';
import { SseNotificationsService } from 'src/infrastructure/sse-notifications/sse-notifications.service';
@Module({
  imports: [
    GroupMembershipModule,
    GroupModule,
    UsersModule,
    SseNotificationsModule,
  ],
  controllers: [GroupInvitesController],
  providers: [
    GroupInvitesService,
    GroupInviteDrizzleRepository,
    SseNotificationsService,
  ],
  exports: [GroupInvitesService],
})
export class GroupInvitesModule {}
