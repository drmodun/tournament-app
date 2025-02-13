import {
  Injectable,
  ForbiddenException,
  ExecutionContext,
} from '@nestjs/common';

@Injectable()
export class PublicTournamentParticipationGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const tournament = context.switchToHttp().getRequest().tournament;

    if (!tournament?.isPublic) {
      throw new ForbiddenException('Tournament is not public.');
    }

    return true;
  }
}
