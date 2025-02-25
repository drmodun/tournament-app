import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import {
  ITournamentResponse,
  tournamentTeamTypeEnum,
  tournamentTeamTypeEnumType,
} from '@tournament-app/types';
import { TeamTypeExtractor } from 'src/base/static/teamTypeExtractor';

@Injectable()
export class TeamTypeTournamentParticipationGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const tournament = request.tournament as ITournamentResponse;

    const originalUrl = request.originalUrl;
    const teamType = TeamTypeExtractor.getTeamTypeFromUrl(originalUrl);

    this.determineApplicability(teamType, tournament.teamType);

    return true;
  }

  private determineApplicability(
    requestType: tournamentTeamTypeEnumType,
    tournamentType: tournamentTeamTypeEnum,
  ) {
    switch (requestType) {
      case tournamentTeamTypeEnum.SOLO:
        if (tournamentType == tournamentTeamTypeEnum.TEAM) {
          throw new ForbiddenException(
            'This tournament does not allow solo applications',
          );
        }
        return;
      case tournamentTeamTypeEnum.TEAM:
        if (tournamentType == tournamentTeamTypeEnum.SOLO) {
          throw new ForbiddenException(
            'This tournament does not allow team applications',
          );
        }
        return;
      case tournamentTeamTypeEnum.MIXED:
        return;
      default:
        throw new ForbiddenException('Invalid team type');
    }
  }
}
