import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty({
    example: 123,
    description: 'Unique identifier for the roster',
    readOnly: true,
  })
  id: number;

  @ApiProperty({
    description: 'ID of the stage this roster belongs to',
    example: 456,
    readOnly: true,
  })
  stageId: number;

  @ApiProperty({
    description: 'ID of the participation this roster is associated with',
    example: 789,
    readOnly: true,
  })
  participationId: number;

  @ApiProperty({
    description: 'Group information associated with this roster',
    type: () => MiniGroupResponseWithLogo,
    readOnly: true,
  })
  @Type(() => MiniGroupResponseWithLogo)
  group: IMiniGroupResponseWithLogo;

  @ApiProperty({
    description: 'User information associated with this roster',
    type: () => MiniUserResponseWithProfilePicture,
    readOnly: true,
  })
  @Type(() => MiniUserResponseWithProfilePicture)
  user: IMiniUserResponseWithProfilePicture;
}

export class PlayerDto implements IRosterPlayer {
  @ApiProperty({
    description: 'User information for the player',
    type: () => MiniUserResponseWithCountry,
    readOnly: true,
  })
  @Type(() => MiniUserResponseWithCountry)
  user: IMiniUserResponseWithCountry;

  @ApiProperty({
    description: 'Whether the player is a substitute',
    example: false,
    readOnly: true,
  })
  isSubstitute: boolean;

  @ApiProperty({
    description: 'Career information for the player',
    type: () => [CareerCategoryResponse],
    readOnly: true,
  })
  @Type(() => CareerCategoryResponse)
  career: ICareerCategoryResponse[];
}

export class RosterDto extends MiniRosterDto implements IRosterResponse {
  @ApiProperty({
    description: 'List of players in the roster',
    type: () => [PlayerDto],
    readOnly: true,
  })
  @Type(() => PlayerDto)
  players: PlayerDto[];

  @ApiProperty({
    description: 'Date when the roster was created',
    example: '2023-01-15T12:30:45Z',
    readOnly: true,
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date when the roster was last updated',
    example: '2023-01-20T09:15:30Z',
    readOnly: true,
  })
  updatedAt: Date;
}
