import { CanActivate, ExecutionContext } from '@nestjs/common';
import { userRoleEnum } from '@tournament-app/types';
import { Observable } from 'rxjs';
import { GroupService } from '../group.service';

export class GroupAdminGuard implements CanActivate {
  constructor(private readonly groupService: GroupService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    const user = request.user;

    const groupId =
      request.params.groupId ||
      request.body.groupId ||
      request.query.groupId ||
      null;

    if (!groupId) {
      return false;
    }

    if (!user) {
      return false;
    }

    if (user.role === userRoleEnum.ADMIN) return true;

    return this.groupService.isGroupAdmin(groupId, user.id);
  }
}
