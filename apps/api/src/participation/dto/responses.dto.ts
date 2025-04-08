import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IMiniParticipationResponse,
  IParticipationResponse,
  IExtendedParticipationResponse,
  IMiniParticipationResponseWithGroup,
} from '@tournament-app/types';
import { MiniTournamentResponse } from 'src/tournament/dto/responses.dto';
import {
  MiniGroupResponse,
  MiniGroupResponseWithLogo,
} from 'src/group/dto/responses.dto';
import { MiniUserResponse } from 'src/users/dto/responses.dto';

export class MiniParticipationResponse implements IMiniParticipationResponse {
  @ApiProperty({
    description: 'Unique identifier for the participation',
    example: 123,
    readOnly: true,
  })
  id: number;

  @ApiPropertyOptional({
    description: 'ID of the user participating in the tournament',
    example: 456,
    readOnly: true,
    nullable: true,
  })
  userId?: number;

  @ApiPropertyOptional({
    description: 'ID of the group participating in the tournament',
    example: 789,
    readOnly: true,
    nullable: true,
  })
  groupId?: number;

  @ApiProperty({
    description: 'ID of the tournament being participated in',
    example: 101,
    readOnly: true,
  })
  tournamentId: number;
}

export class ParticipationResponse
  extends MiniParticipationResponse
  implements IParticipationResponse
{
  @ApiProperty({
    description: 'Tournament information',
    type: () => MiniTournamentResponse,
    readOnly: true,
  })
  tournament: MiniTournamentResponse;

  @ApiPropertyOptional({
    description: 'Group information if participating as a group',
    type: () => MiniGroupResponse,
    readOnly: true,
    nullable: true,
  })
  group?: MiniGroupResponse;

  @ApiPropertyOptional({
    description: 'User information if participating as an individual',
    type: () => MiniUserResponse,
    readOnly: true,
    nullable: true,
  })
  user?: MiniUserResponse;

  @ApiProperty({
    description: 'Date when the participation was created',
    example: '2023-01-15T12:30:45Z',
    readOnly: true,
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date when the participation was last updated',
    example: '2023-01-20T09:15:30Z',
    readOnly: true,
  })
  updatedAt: Date;
}

export class MiniParticipationWithGroup
  extends MiniParticipationResponse
  implements IMiniParticipationResponseWithGroup
{
  @ApiProperty({
    description: 'Group information with logo',
    type: () => MiniGroupResponseWithLogo,
    readOnly: true,
  })
  group: MiniGroupResponseWithLogo;
}

export class ExtendedParticipationResponse
  implements IExtendedParticipationResponse {}
