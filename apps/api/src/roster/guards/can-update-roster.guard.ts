import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { ICreateRosterMemberRequest } from '@tournament-app/types';
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
    const stageId = request.params?.stageId || request.body?.stageId;
    const rosterId = request.params?.rosterId || request.body?.rosterId;
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
