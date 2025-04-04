import { forwardRef, Module } from '@nestjs/common';
import { GroupMembershipService } from './group-membership.service';
import { GroupMembershipController } from './group-membership.controller';
import { GroupMembershipDrizzleRepository } from './group-membership.repository';
import { UserDrizzleRepository } from 'src/users/user.repository';
import { GroupDrizzleRepository } from 'src/group/group.repository';
import { GroupModule } from 'src/group/group.module';
import { GroupService } from 'src/group/group.service';
import { SseNotificationsModule } from 'src/infrastructure/sse-notifications/sse-notifications.module';
import { SseNotificationRepository } from 'src/infrastructure/sse-notifications/sse-notification.repository';
import { SseNotificationsService } from 'src/infrastructure/sse-notifications/sse-notifications.service';
import { NotificationTemplatesFiller } from 'src/infrastructure/firebase-notifications/templates';

@Module({
  imports: [forwardRef(() => GroupModule), SseNotificationsModule],
  controllers: [GroupMembershipController],
  providers: [
    GroupMembershipService,
    GroupMembershipDrizzleRepository,
    GroupService,
    UserDrizzleRepository,
    GroupDrizzleRepository,
    SseNotificationRepository,
    SseNotificationsService,
    NotificationTemplatesFiller,
  ],
  exports: [GroupMembershipService, GroupMembershipDrizzleRepository],
})
export class GroupMembershipModule {}
