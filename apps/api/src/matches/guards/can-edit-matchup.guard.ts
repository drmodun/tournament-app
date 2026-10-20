import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { userRoleEnum } from '@tournament-app/types';
import { MatchesService } from '../matches.service';

@Injectable()
export class CanEditMatchupGuard implements CanActivate {
  constructor(private readonly matchesService: MatchesService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    if (request.user?.role === userRoleEnum.ADMIN) {
      return true;
    }
    const matchupId = parseInt(
      request.params.matchupId || request.body.matchupId || request.params.id,
    );

    const userId = request.user.id;

    const result = await this.matchesService.canUserEditMatchup(
      matchupId,
      userId,
    );

    if (!result) {
      throw new ForbiddenException('You are not allowed to edit this matchup');
    }

    return true;
  }
}
