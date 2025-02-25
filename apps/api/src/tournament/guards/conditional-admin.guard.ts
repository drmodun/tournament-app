import { CanActivate, ExecutionContext } from '@nestjs/common';
import { GroupMembershipService } from 'src/group-membership/group-membership.service';
import { GroupAdminGuard } from 'src/group/guards/group-admin.guard';

export class ConditionalAdminGuard
  extends GroupAdminGuard
  implements CanActivate
{
  constructor(groupMembershipService: GroupMembershipService) {
    super(groupMembershipService);
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    if (request?.body?.affiliatedGroupId) {
      return (await super.canActivate(context)) as boolean;
    }

    return true;
  }
}
