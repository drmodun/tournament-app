import { CanActivate, ExecutionContext, Type } from '@nestjs/common';
import { userRoleEnum } from '@tournament-app/types';
import { GroupMembershipService } from '../../group-membership/group-membership.service';

export function GroupRoleGuardMixin(
  roleCheck: keyof Pick<
    GroupMembershipService,
    'isOwner' | 'isAdmin' | 'isMember'
  >,
): Type<CanActivate> {
  class GroupRoleMixin implements CanActivate {
    constructor(
      private readonly groupMembershipService: GroupMembershipService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest();
      const user = request.user;

      const groupId =
        request.params.groupId ||
        request.body.groupId ||
        request.query.groupId ||
        null;

      const parsedGroupId = parseInt(groupId);

      if (!parsedGroupId || isNaN(parsedGroupId)) {
        return false;
      }

      if (!user) {
        return false;
      }

      if (user.role === userRoleEnum.ADMIN) {
        return true;
      }

      // Check if user has any role that would grant them access
      switch (roleCheck) {
        case 'isOwner':
          return this.groupMembershipService.isOwner(parsedGroupId, user.id);
        case 'isAdmin':
          return this.groupMembershipService.isAdmin(parsedGroupId, user.id);
        case 'isMember':
          return this.groupMembershipService.isMember(parsedGroupId, user.id);
        default:
          return false;
      }
    }
  }

  return GroupRoleMixin;
}
