import { CanActivate, ExecutionContext } from '@nestjs/common';
import { GroupAdminGuard } from 'src/group/guards/group-admin.guard';

export class ConditionalAdminGuard
  extends GroupAdminGuard
  implements CanActivate
{
  constructor() {
    super();
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    if (request?.body?.affiliatedGroupId) {
      return (await super.canActivate(context)) as boolean;
    }

    return true;
  }
}
