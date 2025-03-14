import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import {
  IExtendedStageResponse,
  RosterResponsesEnum,
} from '@tournament-app/types';
import { StageService } from 'src/stage/stage.service';
import { RosterService } from '../roster.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CanCreateRosterGuard implements CanActivate {
  constructor(
    private readonly stageService: StageService,
    private readonly rosterService: RosterService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const participationId =
      request.params?.participationId ||
      request.body?.participationId ||
      request.query?.participationId ||
      null;

    const stageId =
      request.params?.stageId ||
      request.body?.stageId ||
      request.query?.stageId ||
      null;

    await this.checkIfRosterAlreadyExists(participationId, stageId);

    if (!stageId) {
      throw new BadRequestException('Stage ID is required');
    }

    if (!participationId) {
      throw new BadRequestException('Participation ID is required');
    }

    const members = request.body?.members;

    if (!members) {
      throw new BadRequestException('Members are required');
    }

    const stage: IExtendedStageResponse = request.stage;

    const firstStageCheck = await this.stageService.isFirstStage(
      stageId,
      stage.tournamentId,
    );

    if (!firstStageCheck) {
      throw new ForbiddenException(
        'You cannot create a roster for a non-initial stage',
      );
    }

    return true;
  }

  async checkIfRosterAlreadyExists(
    participationId: number,
    stageId: number,
  ): Promise<void> {
    const roster = await this.rosterService.findAll({
      participationId, // This effectively destroys the premise of multiple rosters per team, a concious design decision
      stageId,
      responseType: RosterResponsesEnum.MINI,
    });

    if (roster.length > 0) {
      throw new ForbiddenException('Roster already exists');
    }
  }
}
