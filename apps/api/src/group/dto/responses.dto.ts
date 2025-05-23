import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import {
  IMiniGroupResponse,
  IMiniGroupResponseWithLogo,
  IMiniGroupResponseWithCountry,
  IGroupResponse,
  IGroupResponseExtended,
  GroupResponsesEnum,
  GroupSortingEnum,
  ILocationResponse,
} from '^tournament-app/types';
import { Type } from 'class-transformer';
import { LocationResponse } from 'src/location/dto/responses';

export class MiniGroupResponse implements IMiniGroupResponse {
  @ApiResponseProperty()
  id: number;

  @ApiResponseProperty()
  name: string;

  @ApiResponseProperty()
  abbreviation: string;

  @ApiResponseProperty()
  locationId?: number;
}

export class MiniGroupResponseWithLogo
  extends MiniGroupResponse
  implements IMiniGroupResponseWithLogo
{
  @ApiResponseProperty()
  logo: string;
}

export class MiniGroupResponseWithCountry
  extends MiniGroupResponseWithLogo
  implements IMiniGroupResponseWithCountry
{
  @ApiResponseProperty()
  country: string;
}

export class GroupResponse
  extends MiniGroupResponseWithCountry
  implements IGroupResponse
{
  @ApiResponseProperty()
  description: string;

  @ApiResponseProperty()
  type: string;

  @ApiResponseProperty()
  focus: string;

  @ApiResponseProperty({ type: LocationResponse })
  @Type(() => LocationResponse)
  location?: ILocationResponse;

  @ApiResponseProperty()
  updatedAt: string;

  @ApiResponseProperty()
  memberCount: number;
}

export class GroupResponseExtended
  extends GroupResponse
  implements IGroupResponseExtended
{
  @ApiResponseProperty()
  createdAt: string;

  @ApiResponseProperty()
  tournamentCount: number;

  @ApiResponseProperty()
  subscriberCount: number;
}

export class GroupResponsesEnumType {
  @ApiResponseProperty()
  @ApiProperty({ enum: GroupResponsesEnum })
  type: GroupResponsesEnum;
}

export class GroupSortingEnumType {
  @ApiResponseProperty()
  @ApiProperty({ enum: GroupSortingEnum })
  type: GroupSortingEnum;
}
