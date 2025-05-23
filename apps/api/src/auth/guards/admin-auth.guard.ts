import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { userRoleEnum } from '^tournament-app/types';

@Injectable()
export class AdminAuthGuard extends AuthGuard('jwt') {
  constructor() {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const validRequest = (await super.canActivate(context)) as boolean;
    const payload = context.switchToHttp().getRequest().user;

    if (!validRequest || !payload) {
      throw new UnauthorizedException();
    }

    if (payload.role !== userRoleEnum.ADMIN) {
      throw new ForbiddenException();
    }

    return true;
  }
}
