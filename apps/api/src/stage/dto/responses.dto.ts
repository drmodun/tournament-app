import { ApiResponseProperty } from '@nestjs/swagger';
import {
  IMiniStageResponse,
  IStageResponse,
  IStageResponseWithTournament,
  IExtendedStageResponse,
  IExtendedStageResponseWithTournament,
  ILocationResponse,
} from '@tournament-app/types';
import {
  stageStatusEnumType,
  stageTypeEnumType,
} from '@tournament-app/types/src/enums';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { LocationResponse } from 'src/location/dto/responses';
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

  @ApiResponseProperty()
  locationId?: number;
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

  @ApiResponseProperty({ type: LocationResponse })
  @Type(() => LocationResponse)
  location?: ILocationResponse;
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

  @ApiResponseProperty()
  maxChanges: number;
}

export class ExtendedStageResponseWithTournament
  extends ExtendedStageResponse
  implements IExtendedStageResponseWithTournament
{
  @ApiResponseProperty({ type: TournamentResponse })
  tournament: TournamentResponse;
}
