import { ApiResponseProperty } from '@nestjs/swagger';
import {
  ICareerCategoryResponse,
  IMiniGroupResponseWithLogo,
  IMiniRosterResponse,
  IMiniUserResponseWithCountry,
  IMiniUserResponseWithProfilePicture,
  IRosterPlayer,
  IRosterResponse,
} from '@tournament-app/types';
import { Type } from 'class-transformer';
import { MiniUserResponseWithCountry } from 'src/users/dto/responses.dto';
import { MiniGroupResponseWithLogo } from 'src/group/dto/responses.dto';
import { MiniUserResponseWithProfilePicture } from 'src/users/dto/responses.dto';
import { CareerCategoryResponse } from 'src/lfg/dto/responses';
export class MiniRosterDto implements IMiniRosterResponse {
  @ApiResponseProperty()
  id: number;

  @ApiResponseProperty()
  stageId: number;

  @ApiResponseProperty()
  participationId: number;

  @ApiResponseProperty()
  @Type(() => MiniGroupResponseWithLogo)
  group: IMiniGroupResponseWithLogo;

  @ApiResponseProperty()
  @Type(() => MiniUserResponseWithProfilePicture)
  user: IMiniUserResponseWithProfilePicture;
}

export class PlayerDto implements IRosterPlayer {
  @ApiResponseProperty()
  @Type(() => MiniUserResponseWithCountry)
  user: IMiniUserResponseWithCountry;

  @ApiResponseProperty()
  isSubstitute: boolean;

  @ApiResponseProperty()
  @Type(() => CareerCategoryResponse)
  career: ICareerCategoryResponse[];
}

export class RosterDto extends MiniRosterDto implements IRosterResponse {
  @ApiResponseProperty()
  @Type(() => PlayerDto)
  players: PlayerDto[];

  @ApiResponseProperty()
  createdAt: Date;

  @ApiResponseProperty()
  updatedAt: Date;
}
