import { Module } from '@nestjs/common';
import { GroupJoinRequestsService } from './group-join-requests.service';
import { GroupJoinRequestsController } from './group-join-requests.controller';
import { GroupJoinRequestDrizzleRepository } from './group-join-requests.repository';
import { UserDrizzleRepository } from '../users/user.repository';
import { GroupDrizzleRepository } from '../group/group.repository';
import { GroupMembershipModule } from '../group-membership/group-membership.module';
import { GroupService } from 'src/group/group.service';
import { SseNotificationsModule } from 'src/infrastructure/sse-notifications/sse-notifications.module';
import { SseNotificationRepository } from 'src/infrastructure/sse-notifications/sse-notification.repository';
import { GroupRequirementsModule } from 'src/group/requirements/group-requirements.module';
@Module({
  imports: [
    GroupMembershipModule,
    SseNotificationsModule,
    GroupRequirementsModule,
  ],
  controllers: [GroupJoinRequestsController],
  providers: [
    GroupJoinRequestsService,
    GroupJoinRequestDrizzleRepository,
    UserDrizzleRepository,
    GroupDrizzleRepository,
    GroupService,
    SseNotificationRepository,
  ],
  exports: [GroupJoinRequestsService],
})
export class GroupJoinRequestsModule {}
