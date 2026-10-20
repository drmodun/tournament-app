import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import {
  IExtendedTournamentResponse,
  tournamentTeamTypeEnum,
} from '@tournament-app/types';
import { TeamTypeExtractor } from 'src/base/static/teamTypeExtractor';
import { ParticipationService } from '../participation.service';

@Injectable()
export class DoubleParticipationGuard implements CanActivate {
  constructor(private readonly participationService: ParticipationService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const tournament = request.tournament as IExtendedTournamentResponse;

    const isTeamEntry =
      TeamTypeExtractor.getTeamTypeFromUrl(request.originalUrl) ===
      tournamentTeamTypeEnum.TEAM;

    // A group may enter several teams only when the tournament allows it
    if (isTeamEntry && tournament.isMultipleTeamsPerGroupAllowed) {
      return true;
    }

    // Team entries are matched by group, solo entries by user; mixing both never matches anything
    const isAlreadyParticipating = await this.participationService.isParticipant(
      tournament.id,
      isTeamEntry
        ? { groupId: request.params.groupId }
        : { userId: request.params.userId || request.user.id },
    );

    if (isAlreadyParticipating) {
      throw new ForbiddenException(
        isTeamEntry
          ? 'This group is already participating in this tournament'
          : 'You are already participating in this tournament',
      );
    }

    return true;
  }
}
