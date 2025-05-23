import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import {
  IExtendedTournamentResponse,
  TournamentResponsesEnum,
} from '^tournament-app/types';
import { TournamentService } from 'src/tournament/tournament.service';

@Injectable()
export class TournamentMaximumParticipantsGuard implements CanActivate {
  constructor(private readonly tournamentService: TournamentService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const tournamentId =
      request.params.tournamentId ||
      request.body.tournamentId ||
      request.query.tournamentId ||
      null;

    const tournament =
      await this.tournamentService.findOne<IExtendedTournamentResponse>(
        tournamentId,
        TournamentResponsesEnum.EXTENDED,
      );

    const participantCount = tournament.currentParticipants || 0;

    if (participantCount >= tournament.maxParticipants) {
      throw new ForbiddenException('Maximum number of participants reached.');
    }

    request.tournament = tournament;

    return true;
  }
}
