import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Type,
} from '@nestjs/common';
import { userRoleEnum } from '^tournament-app/types';
import { GroupMembershipService } from '../../group-membership/group-membership.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

export function GroupRoleGuardMixin(
  roleCheck: keyof Pick<
    GroupMembershipService,
    'isOwner' | 'isAdmin' | 'isMember'
  >,
): Type<CanActivate> {
  @Injectable()
  class GroupRoleMixin extends JwtAuthGuard implements CanActivate {
    constructor(
      private readonly groupMembershipService: GroupMembershipService,
    ) {
      super();
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
      if (!(await super.canActivate(context))) {
        return false;
      } // This fills in the user

      const request = context.switchToHttp().getRequest();
      const user = request.user;

      const groupId =
        request.params.groupId ||
        request.body.groupId ||
        request.query.groupId ||
        request.body.affiliatedGroupId ||
        null;

      const parsedGroupId = parseInt(groupId);

      if (!parsedGroupId || isNaN(parsedGroupId)) {
        return false;
      }

      if (!user) {
        return false;
      }

      if (user.role == userRoleEnum.ADMIN) {
        return true;
      }

      // Check if user has any role that would grant them access
      switch (roleCheck) {
        case 'isOwner':
          return await this.groupMembershipService.isOwner(
            parsedGroupId,
            user.id,
          );
        case 'isAdmin':
          return await this.groupMembershipService.isAdmin(
            parsedGroupId,
            user.id,
          );
        case 'isMember':
          return await this.groupMembershipService.isMember(
            parsedGroupId,
            user.id,
          );
        default:
          return false;
      }
    }
  }

  return GroupRoleMixin;
}
