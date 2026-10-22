import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { userRoleEnum } from '@tournament-app/types';
import { JwtAuthGuard } from './jwt-auth.guard';

export const ADMIN_NEEDS_LOGIN_MESSAGE =
  'Admin actions need a login, not an API token';

@Injectable()
export class AdminAuthGuard extends JwtAuthGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const validRequest = (await super.canActivate(context)) as boolean;
    const payload = context.switchToHttp().getRequest().user;

    if (!validRequest || !payload) {
      throw new UnauthorizedException();
    }

    if (payload.tokenId) {
      throw new ForbiddenException(ADMIN_NEEDS_LOGIN_MESSAGE);
    }

    if (payload.role !== userRoleEnum.ADMIN) {
      throw new ForbiddenException();
    }

    return true;
  }
}
