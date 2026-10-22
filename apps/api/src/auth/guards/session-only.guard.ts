import {
  applyDecorators,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from './jwt-auth.guard';

export const SESSION_ONLY_MESSAGE =
  'This action needs a login, not an API token';

// Logs the user in like JwtAuthGuard, then refuses API tokens
@Injectable()
export class SessionOnlyGuard extends JwtAuthGuard {
  async canActivate(context: ExecutionContext) {
    await super.canActivate(context);

    if (context.switchToHttp().getRequest().user?.tokenId) {
      throw new ForbiddenException(SESSION_ONLY_MESSAGE);
    }

    return true;
  }
}

// For actions a leaked API token must not be able to do: managing tokens and deleting the
// account. Use it instead of UseGuards(JwtAuthGuard).
export const SessionOnly = () =>
  applyDecorators(UseGuards(SessionOnlyGuard), ApiBearerAuth());
