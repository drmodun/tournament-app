import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import {
  ICreateRosterMemberRequest,
  userRoleEnum,
} from '@tournament-app/types';
import { rosterIdOf } from './roster-check.guard';
import { IExtendedStageResponse } from '@tournament-app/types';
import { StageService } from 'src/stage/stage.service';
import { RosterService } from '../roster.service';

@Injectable()
export class CanUpdateRosterGuard implements CanActivate {
  constructor(
    private readonly rosterService: RosterService,
    private readonly stageService: StageService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Site admins skip the roster rules, like in CanRosterBeUsedGuard
    if (request.user?.role === userRoleEnum.ADMIN) {
      return true;
    }

    const stageId =
      request.params?.stageId || request.body?.stageId || request.stage?.id;
    const rosterId = rosterIdOf(request);
    const members: ICreateRosterMemberRequest[] = request.body?.members;

    if (!stageId) {
      throw new BadRequestException('Stage ID is required');
    }

    if (!rosterId) {
      throw new BadRequestException('Roster ID is required');
    }

    const stage: IExtendedStageResponse = request.stage;

    const getTournamentStages =
      await this.stageService.getStagesSortedByStartDate(stage.tournamentId);

    const currentStageIndex = getTournamentStages.findIndex(
      (s) => s.id === stage.id,
    );

    if (currentStageIndex === 0) {
      return true;
    }

    return (
      stage.maxChanges >=
      (await this.rosterService.getChangeAmount(
        rosterId,
        members.map((m) => m.userId),
      ))
    );
  }
}
