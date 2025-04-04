import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { StageService } from '../stage.service';
import { TournamentService } from '../../tournament/tournament.service';
import { userRoleEnum } from '@tournament-app/types';
import {
  ITournamentWithRelations,
  TournamentDtosEnum,
} from '../../tournament/types';
import { GroupMembershipService } from 'src/group-membership/group-membership.service';
import { StageResponsesEnum, IStageResponse } from '@tournament-app/types';

@Injectable()
export class StageAdminGuard extends JwtAuthGuard implements CanActivate {
  constructor(
    private readonly stageService: StageService,
    private readonly tournamentService: TournamentService,
    private readonly groupMembershipService: GroupMembershipService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (user.role === userRoleEnum.ADMIN) {
      return true;
    }

    const stageId =
      request.params.stageId ||
      request.body.stageId ||
      request.query.stageId ||
      null;

    if (!stageId) {
      return false;
    }

    let stage: IStageResponse;
    try {
      stage = await this.stageService.findOne(
        Number(stageId),
        StageResponsesEnum.BASE,
      );
    } catch (error) {
      return false;
    }

    if (!stage || !stage.tournamentId) {
      return false;
    }

    const tournament =
      await this.tournamentService.findOne<ITournamentWithRelations>(
        stage.tournamentId,
        TournamentDtosEnum.WITH_RELATIONS,
      );

    if (!tournament) {
      return false;
    }

    if (tournament.creatorId === user.id) {
      return true;
    }

    if (!tournament.affiliatedGroupId) {
      return false;
    }

    return await this.groupMembershipService.isAdmin(
      tournament.affiliatedGroupId,
      user.id,
    );
  }
}
