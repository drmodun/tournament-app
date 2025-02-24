import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { ParticipationService } from 'src/participation/participation.service';
import { IParticipationResponse } from '@tournament-app/types';
import { TournamentResponse } from 'src/tournament/dto/responses.dto';
import { GroupMembershipService } from 'src/group-membership/group-membership.service';
import { TournamentService } from 'src/tournament/tournament.service';

@Injectable()
export class CanCancelParticipationGuard implements CanActivate {
  constructor(
    private participationService: ParticipationService,
    private groupMembershipService: GroupMembershipService,
    private tournamentService: TournamentService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const participationId = request.params.participationId;
    const user = request.user;

    const participation =
      await this.participationService.findOne<IParticipationResponse>(
        participationId,
      );

    if (!participation) {
      throw new ForbiddenException('Participation not found');
    }

    const tournament: TournamentResponse =
      await this.tournamentService.findOne<TournamentResponse>(
        participation.tournamentId,
      );

    if (tournament?.creator?.id == user.id) {
      return true;
    }

    if (tournament?.affiliatedGroup?.id) {
      const isAdmin = await this.groupMembershipService.isAdmin(
        tournament.affiliatedGroup.id,
        user.id,
      );

      if (isAdmin) {
        return true;
      }
    }

    if (tournament?.endDate < new Date()) {
      throw new ForbiddenException(
        'Cannot cancel participation in a tournament that has already finished',
      );
    }

    const userCheck = participation.userId === user.id;
    const groupCheck = await this.groupMembershipService.isAdmin(
      participation.groupId,
      user.id,
    );

    if (!userCheck && !groupCheck) {
      throw new ForbiddenException(
        'You are not allowed to cancel this participation',
      );
    }

    return true;
  }
}
