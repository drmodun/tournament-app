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

    // Check if the matchup exists and belongs to the tournament
    const belongsToTournament = await this.matchesService.isMatchupInTournament(
      matchupId,
      tournamentId,
    );

    if (!belongsToTournament) {
      throw new ForbiddenException(
        `Matchup with ID ${matchupId} does not belong to tournament with ID ${tournamentId}`,
      );
    }

    // Get the matchup for later use
    try {
      const matchup = await this.matchesService.getMatchupById(matchupId);
      request.matchup = matchup;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      // If there's another error, we've already verified the matchup exists,
      // so we can continue without storing it in the request
    }

    return true;
  }
}
