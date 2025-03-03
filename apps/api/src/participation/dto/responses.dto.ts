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
  @ApiProperty()
  id: number;

  @ApiPropertyOptional()
  userId?: number;

  @ApiPropertyOptional()
  groupId?: number;

  @ApiProperty()
  tournamentId: number;
}

export class ParticipationResponse
  extends MiniParticipationResponse
  implements IParticipationResponse
{
  @ApiProperty()
  tournament: MiniTournamentResponse;

  @ApiPropertyOptional()
  group?: MiniGroupResponse;

  @ApiPropertyOptional()
  user?: MiniUserResponse;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class MiniParticipationWithGroup
  extends MiniParticipationResponse
  implements IMiniParticipationResponseWithGroup
{
  @ApiProperty()
  group: MiniGroupResponseWithLogo;
}

export class ExtendedParticipationResponse
  implements IExtendedParticipationResponse {
  // TODO: add roster and match data later here
}
