import { ApiProperty } from '@nestjs/swagger';
import {
  IMiniStageResponse,
  IStageResponse,
  IStageResponseWithTournament,
  IExtendedStageResponse,
  IExtendedStageResponseWithTournament,
  ILocationResponse,
} from '@tournament-app/types';
import { stageStatusEnum, stageTypeEnum } from '@tournament-app/types';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { LocationResponse } from 'src/location/dto/responses';
import {
  MiniTournamentResponseWithLogo,
  TournamentResponse,
} from 'src/tournament/dto/responses.dto';

export class MiniStageResponse implements IMiniStageResponse {
  @ApiProperty({
    description: 'Unique identifier for the stage',
    example: 1,
    readOnly: true,
  })
  id: number;

  @ApiProperty({
    description: 'Name of the stage',
    example: 'Group Stage',
    readOnly: true,
  })
  name: string;

  @ApiProperty({
    description: 'ID of the tournament this stage belongs to',
    example: 1,
    readOnly: true,
  })
  tournamentId: number;

  @ApiProperty({
    description: 'Current status of the stage',
    enum: stageStatusEnum,
    example: 'ONGOING',
    readOnly: true,
  })
  stageStatus: stageStatusEnum;

  @ApiProperty({
    description: 'ID of the physical location for the stage',
    example: 1,
    readOnly: true,
    required: false,
  })
  locationId?: number;
}

export class StageResponse extends MiniStageResponse implements IStageResponse {
  @ApiProperty({
    description: 'Type of the stage',
    enum: stageTypeEnum,
    example: 'ROUND_ROBIN',
    readOnly: true,
  })
  stageType: stageTypeEnum;

  @ApiProperty({
    description: 'Detailed description of the stage',
    example: 'Initial group stage of the tournament',
    readOnly: true,
  })
  description: string;

  @IsOptional()
  @ApiProperty({
    description: 'URL to the stage logo',
    example: 'https://example.com/stage-logo.jpg',
    readOnly: true,
    required: false,
  })
  logo?: string;

  @ApiProperty({
    description: 'Number of rosters participating in this stage',
    example: 8,
    readOnly: true,
  })
  rostersParticipating: number;

  @ApiProperty({
    description: 'Start date and time of the stage',
    example: '2025-02-01T10:00:00Z',
    type: Date,
    readOnly: true,
  })
  startDate: Date;

  @ApiProperty({
    description: 'End date and time of the stage',
    example: '2025-02-15T18:00:00Z',
    type: Date,
    readOnly: true,
  })
  endDate: Date;

  @ApiProperty({
    description: 'Location details for the stage',
    type: LocationResponse,
    readOnly: true,
    required: false,
  })
  @Type(() => LocationResponse)
  location?: ILocationResponse;
}

export class StageResponseWithTournament
  extends StageResponse
  implements IStageResponseWithTournament
{
  @ApiProperty({
    description: 'Tournament details associated with this stage',
    type: MiniTournamentResponseWithLogo,
    readOnly: true,
  })
  tournament: MiniTournamentResponseWithLogo;
}

export class ExtendedStageResponse
  extends StageResponse
  implements IExtendedStageResponse
{
  @ApiProperty({
    description: 'End date and time of the stage',
    example: '2025-02-15T18:00:00Z',
    type: Date,
    readOnly: true,
  })
  endDate: Date;

  @ApiProperty({
    description: 'Start date and time of the stage',
    example: '2025-02-01T10:00:00Z',
    type: Date,
    readOnly: true,
  })
  startDate: Date;

  @ApiProperty({
    description: 'Minimum number of players required per team',
    example: 1,
    readOnly: true,
  })
  minPlayersPerTeam: number;

  @ApiProperty({
    description: 'Maximum number of players allowed per team',
    example: 1,
    readOnly: true,
    required: false,
  })
  maxPlayersPerTeam?: number;

  @ApiProperty({
    description: 'Maximum number of roster changes allowed',
    example: 1,
    readOnly: true,
    required: false,
  })
  maxChanges?: number;

  @ApiProperty({
    description: 'Maximum number of substitutes allowed',
    example: 1,
    readOnly: true,
    required: false,
  })
  maxSubstitutes?: number;

  @ApiProperty({
    description: 'Challonge tournament ID associated with this stage',
    example: 'tournament123',
    readOnly: true,
    required: false,
  })
  challongeTournamentId?: string;
}

export class ExtendedStageResponseWithTournament
  extends ExtendedStageResponse
  implements IExtendedStageResponseWithTournament
{
  @ApiProperty({
    description: 'Full tournament details associated with this stage',
    type: TournamentResponse,
    readOnly: true,
  })
  tournament: TournamentResponse;

  @ApiProperty({
    description: 'Challonge tournament ID associated with this stage',
    example: 'tournament123',
    readOnly: true,
    required: false,
  })
  challongeTournamentId?: string;
}
