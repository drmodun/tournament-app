import { ApiProperty } from '@nestjs/swagger';
import {
  IMiniTournamentResponse,
  IMiniTournamentResponseWithLogo,
  ITournamentResponse,
  IExtendedTournamentResponse,
  tournamentTypeEnum,
  tournamentLocationEnum,
  tournamentTeamTypeEnum,
  ILocationResponse,
} from '@tournament-app/types';
import { CategoryMiniResponseWithLogo } from 'src/category/dto/responses.dto';
import { LocationResponse } from 'src/location/dto/responses';
import { MiniGroupResponse } from 'src/group/dto/responses.dto';
import { MiniUserResponse } from 'src/users/dto/responses.dto';
import { Type } from 'class-transformer';

export class MiniTournamentResponse implements IMiniTournamentResponse {
  @ApiProperty({
    description: 'Unique identifier for the tournament',
    example: 123,
    readOnly: true,
  })
  id: number;

  @ApiProperty({
    description: 'Name of the tournament',
    example: 'Summer Championship 2023',
    readOnly: true,
  })
  name: string;

  @ApiProperty({
    description: 'Type of tournament',
    example: 'SINGLE_ELIMINATION',
    enum: tournamentTypeEnum,
    readOnly: true,
  })
  type: tournamentTypeEnum;

  @ApiProperty({
    description: 'Start date and time of the tournament',
    example: '2023-07-01T10:00:00Z',
    readOnly: true,
  })
  startDate: Date;

  @ApiProperty({
    description: 'ID of the location where the tournament is held',
    example: 456,
    nullable: true,
    readOnly: true,
  })
  locationId?: number;
}

export class MiniTournamentResponseWithLogo
  extends MiniTournamentResponse
  implements IMiniTournamentResponseWithLogo
{
  @ApiProperty({
    description: 'Location type of the tournament',
    example: 'ONLINE',
    enum: tournamentLocationEnum,
    readOnly: true,
  })
  location: tournamentLocationEnum;

  @ApiProperty({
    description: 'URL to the tournament logo',
    example: 'https://example.com/images/tournament-logo.png',
    readOnly: true,
  })
  logo: string;

  @ApiProperty({
    description: 'Two-letter country code where the tournament is held',
    example: 'US',
    readOnly: true,
  })
  country: string;
}

export class TournamentResponse
  extends MiniTournamentResponseWithLogo
  implements ITournamentResponse
{
  @ApiProperty({
    description: 'Detailed description of the tournament',
    example:
      'Annual summer championship tournament with prizes for top 3 teams',
    readOnly: true,
  })
  description: string;

  @ApiProperty({
    description: 'Team type for the tournament',
    example: 'SINGLE',
    enum: tournamentTeamTypeEnum,
    readOnly: true,
  })
  teamType: tournamentTeamTypeEnum;

  @ApiProperty({
    description: 'User who created the tournament',
    type: () => MiniUserResponse,
    readOnly: true,
  })
  creator: MiniUserResponse;

  @ApiProperty({
    description: 'Group affiliated with the tournament',
    type: () => MiniGroupResponse,
    nullable: true,
    readOnly: true,
  })
  affiliatedGroup?: MiniGroupResponse;

  @ApiProperty({
    description: 'End date and time of the tournament',
    example: '2023-07-15T18:00:00Z',
    readOnly: true,
  })
  endDate: Date;

  @ApiProperty({
    description: 'Maximum number of participants allowed in the tournament',
    example: 64,
    readOnly: true,
  })
  maxParticipants: number;

  @ApiProperty({
    description: 'Current number of participants in the tournament',
    example: 32,
    readOnly: true,
  })
  currentParticipants: number;

  @ApiProperty({
    description: 'Whether the tournament is public or private',
    example: true,
    readOnly: true,
  })
  isPublic: boolean;

  @ApiProperty({
    description: 'Category this tournament belongs to',
    type: () => CategoryMiniResponseWithLogo,
    readOnly: true,
  })
  category: CategoryMiniResponseWithLogo;

  @ApiProperty({
    description: 'External links related to the tournament',
    example: 'https://example.com/tournament-info',
    nullable: true,
    readOnly: true,
  })
  links: string;

  @ApiProperty({
    description: 'Detailed location information for the tournament',
    type: () => LocationResponse,
    nullable: true,
    readOnly: true,
  })
  @Type(() => LocationResponse)
  actualLocation?: ILocationResponse;
}

export class ExtendedTournamentResponse
  extends TournamentResponse
  implements IExtendedTournamentResponse
{
  @ApiProperty({
    description: 'Date when the tournament was created',
    example: '2023-01-15T12:30:45Z',
    readOnly: true,
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date when the tournament was last updated',
    example: '2023-01-20T09:15:30Z',
    readOnly: true,
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'External links related to the tournament',
    example: 'https://example.com/tournament-info',
    readOnly: true,
  })
  links: string;

  @ApiProperty({
    description: 'Whether multiple teams per group are allowed',
    example: false,
    readOnly: true,
  })
  isMultipleTeamsPerGroupAllowed: boolean;

  @ApiProperty({
    description: 'Whether fake players are allowed in the tournament',
    example: false,
    readOnly: true,
  })
  isFakePlayersAllowed: boolean;

  @ApiProperty({
    description: 'Parent tournament if this is a sub-tournament',
    type: () => MiniTournamentResponseWithLogo,
    nullable: true,
    readOnly: true,
  })
  parentTournament: MiniTournamentResponseWithLogo;

  @ApiProperty({
    description: 'ID of the conversion rule applied to this tournament',
    example: 789,
    nullable: true,
    readOnly: true,
  })
  conversionRuleId: number;

  @ApiProperty({
    description: 'Whether the tournament is ranked',
    example: true,
    readOnly: true,
  })
  isRanked: boolean;

  @ApiProperty({
    description: 'Maximum MMR (Matchmaking Rating) allowed for participants',
    example: 2500,
    nullable: true,
    readOnly: true,
  })
  maximumMMR: number;

  @ApiProperty({
    description: 'Minimum MMR (Matchmaking Rating) required for participants',
    example: 1000,
    nullable: true,
    readOnly: true,
  })
  minimumMMR: number;
}
