import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import {
  IMiniGroupResponse,
  IMiniGroupResponseWithLogo,
  IMiniGroupResponseWithCountry,
  IGroupResponse,
  IGroupResponseExtended,
  GroupResponsesEnum,
  GroupSortingEnum,
} from '@tournament-app/types';

export class MiniGroupResponse implements IMiniGroupResponse {
  @ApiResponseProperty()
  id: number;

  @ApiResponseProperty()
  name: string;

  @ApiResponseProperty()
  abbreviation: string;
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

  @ApiResponseProperty()
  location: string;

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
