import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { MatchesService } from '../matches.service';

@Injectable()
export class CanEditMatchupGuard implements CanActivate {
  constructor(private readonly matchesService: MatchesService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const matchupId = parseInt(request.params.matchupId, 10);
    const tournamentId = parseInt(request.params.tournamentId, 10);

    if (isNaN(matchupId) || isNaN(tournamentId)) {
      throw new ForbiddenException('Invalid matchup or tournament ID');
    }

    const result = await this.matchesService.isMatchupInTournament(
      matchupId,
      tournamentId,
    );

    if (!result.exists) {
      throw new NotFoundException(`Matchup with ID ${matchupId} not found`);
    }

    if (!result.belongsToTournament) {
      throw new ForbiddenException(
        `Matchup with ID ${matchupId} does not belong to tournament with ID ${tournamentId}`,
      );
    }

    request.matchup = result.matchup;

    return true;
  }
}
