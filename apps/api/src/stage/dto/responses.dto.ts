import { ApiResponseProperty } from '@nestjs/swagger';
import {
  IMiniStageResponse,
  IStageResponse,
  IStageResponseWithTournament,
  IExtendedStageResponse,
  IExtendedStageResponseWithTournament,
} from '@tournament-app/types';
import {
  stageStatusEnumType,
  stageTypeEnumType,
} from '@tournament-app/types/src/enums';
import { IsOptional } from 'class-validator';
import {
  MiniTournamentResponseWithLogo,
  TournamentResponse,
} from 'src/tournament/dto/responses.dto';

export class MiniStageResponse implements IMiniStageResponse {
  @ApiResponseProperty()
  id: number;

  @ApiResponseProperty()
  name: string;

  @ApiResponseProperty()
  tournamentId: number;

  @ApiResponseProperty()
  stageStatus: stageStatusEnumType;
}

export class StageResponse extends MiniStageResponse implements IStageResponse {
  @ApiResponseProperty()
  stageType: stageTypeEnumType;

  @ApiResponseProperty()
  description: string;

  @IsOptional()
  @ApiResponseProperty()
  logo?: string;

  @ApiResponseProperty()
  rostersParticipating: number;

  @ApiResponseProperty()
  startDate: Date;

  @ApiResponseProperty()
  endDate: Date;
}

export class StageResponseWithTournament
  extends StageResponse
  implements IStageResponseWithTournament
{
  @ApiResponseProperty({ type: MiniTournamentResponseWithLogo })
  tournament: MiniTournamentResponseWithLogo;
}

export class ExtendedStageResponse
  extends StageResponse
  implements IExtendedStageResponse
{
  @ApiResponseProperty()
  endDate: Date;

  @ApiResponseProperty()
  startDate: Date;

  @ApiResponseProperty()
  minPlayersPerTeam: number;

  @ApiResponseProperty()
  maxPlayersPerTeam: number;
}

export class ExtendedStageResponseWithTournament
  extends ExtendedStageResponse
  implements IExtendedStageResponseWithTournament
{
  @ApiResponseProperty({ type: TournamentResponse })
  tournament: TournamentResponse;
}
