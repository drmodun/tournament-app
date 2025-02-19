import { ApiResponseProperty } from '@nestjs/swagger';
import {
  IMiniTournamentResponse,
  IMiniTournamentResponseWithLogo,
  ITournamentResponse,
  IExtendedTournamentResponse,
  tournamentTypeEnum,
  tournamentLocationEnum,
  tournamentTeamTypeEnum,
} from '@tournament-app/types';
import { CategoryMiniResponseWithLogo } from 'src/category/dto/responses.dto';
import { MiniGroupResponse } from 'src/group/dto/responses.dto';
import { MiniUserResponse } from 'src/users/dto/responses.dto';

export class MiniTournamentResponse implements IMiniTournamentResponse {
  @ApiResponseProperty()
  id: number;

  @ApiResponseProperty()
  name: string;

  @ApiResponseProperty()
  type: tournamentTypeEnum;

  @ApiResponseProperty()
  startDate: Date;
}

export class MiniTournamentResponseWithLogo
  extends MiniTournamentResponse
  implements IMiniTournamentResponseWithLogo
{
  @ApiResponseProperty()
  location: tournamentLocationEnum;

  @ApiResponseProperty()
  logo: string;

  @ApiResponseProperty()
  country: string;
}

export class TournamentResponse
  extends MiniTournamentResponseWithLogo
  implements ITournamentResponse
{
  @ApiResponseProperty()
  description: string;

  @ApiResponseProperty()
  teamType: tournamentTeamTypeEnum;

  @ApiResponseProperty({ type: MiniUserResponse })
  creator: MiniUserResponse;

  @ApiResponseProperty({ type: MiniGroupResponse })
  affiliatedGroup?: MiniGroupResponse;

  @ApiResponseProperty()
  endDate: Date;

  @ApiResponseProperty()
  maxParticipants: number;

  @ApiResponseProperty()
  currentParticipants: number;

  @ApiResponseProperty()
  isPublic: boolean;

  @ApiResponseProperty({ type: CategoryMiniResponseWithLogo })
  category: CategoryMiniResponseWithLogo;

  @ApiResponseProperty()
  links: string;
}

export class ExtendedTournamentResponse
  extends TournamentResponse
  implements IExtendedTournamentResponse
{
  @ApiResponseProperty()
  createdAt: Date;

  @ApiResponseProperty()
  updatedAt: Date;

  @ApiResponseProperty()
  links: string;

  @ApiResponseProperty()
  isMultipleTeamsPerGroupAllowed: boolean;

  @ApiResponseProperty()
  isFakePlayersAllowed: boolean;

  @ApiResponseProperty({ type: MiniTournamentResponseWithLogo })
  parentTournament: MiniTournamentResponseWithLogo;

  @ApiResponseProperty()
  conversionRuleId: number;

  @ApiResponseProperty()
  isRanked: boolean;

  @ApiResponseProperty()
  maximumMMR: number;

  @ApiResponseProperty()
  minimumMMR: number;
}
