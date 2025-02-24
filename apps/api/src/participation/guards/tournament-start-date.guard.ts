import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { ITournamentResponse } from '@tournament-app/types';
import { TournamentService } from 'src/tournament/tournament.service';
import { TournamentMaximumParticipantsGuard } from './tournament-max-participants.guard';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TournamentStartDateGuard
  extends TournamentMaximumParticipantsGuard
  implements CanActivate
{
  constructor(tournamentService: TournamentService) {
    super(tournamentService);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    await super.canActivate(context);
    const request = context.switchToHttp().getRequest();
    const tournament = request.tournament as ITournamentResponse;

    const currentDate = new Date();
    const startDate = new Date(tournament.startDate);

    if (currentDate >= startDate) {
      throw new ForbiddenException(
        'Cannot participate in a tournament that has already started',
      );
    }

    return true;
  }
}
