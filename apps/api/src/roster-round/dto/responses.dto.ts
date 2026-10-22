import { ApiResponseProperty } from '@nestjs/swagger';
import { IRosterRoundResponse } from '@tournament-app/types';

export class RosterRoundResponse implements IRosterRoundResponse {
  @ApiResponseProperty()
  rosterId: number;

  @ApiResponseProperty()
  roundId: number;

  @ApiResponseProperty()
  stageId: number;

  @ApiResponseProperty()
  roundNumber: number;

  @ApiResponseProperty()
  score: number;

  @ApiResponseProperty()
  isWinner: boolean;

  @ApiResponseProperty()
  createdAt: Date;
}
