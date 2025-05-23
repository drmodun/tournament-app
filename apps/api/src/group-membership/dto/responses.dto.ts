import { ApiResponseProperty } from '@nestjs/swagger';
import {
  IMinimalMembershipResponse,
  IGroupMembershipResponse,
  IUserMembershipResponseWithDates,
  IGroupMembershipResponseWithDates,
  groupRoleEnumType,
  groupRoleEnum,
} from '^tournament-app/types';
import {
  MiniGroupResponseWithLogo,
  MiniGroupResponseWithCountry,
} from '../../group/dto/responses.dto';
import {
  MiniUserResponseWithProfilePicture,
  MiniUserResponseWithCountry,
} from '../../users/dto/responses.dto';

export class MinimalMembershipResponse implements IMinimalMembershipResponse {
  @ApiResponseProperty()
  groupId: number;

  @ApiResponseProperty()
  userId: number;

  @ApiResponseProperty({ enum: groupRoleEnum })
  role: groupRoleEnumType;
}

export class GroupMembershipResponse implements IGroupMembershipResponse {
  @ApiResponseProperty()
  groupId: number;

  @ApiResponseProperty()
  userId: number;

  @ApiResponseProperty({ enum: groupRoleEnum })
  role: groupRoleEnumType;

  @ApiResponseProperty({ type: () => MiniUserResponseWithProfilePicture })
  user: MiniUserResponseWithProfilePicture;

  @ApiResponseProperty({ type: () => MiniGroupResponseWithLogo })
  group: MiniGroupResponseWithLogo;

  @ApiResponseProperty()
  createdAt: string;
}

export class UserMembershipResponseWithDates
  extends MiniUserResponseWithCountry
  implements IUserMembershipResponseWithDates
{
  @ApiResponseProperty()
  createdAt: Date;

  @ApiResponseProperty({ enum: groupRoleEnum })
  role: groupRoleEnumType;
}

export class GroupMembershipResponseWithDates
  extends MiniGroupResponseWithCountry
  implements IGroupMembershipResponseWithDates
{
  @ApiResponseProperty()
  createdAt: Date;

  @ApiResponseProperty({ enum: groupRoleEnum })
  role: groupRoleEnumType;
}

export class GroupMembershipKey implements IGroupMembershipKey {
  @ApiResponseProperty()
  userId: number;

  @ApiResponseProperty()
  groupId: number;

  [key: string]: number;
}

export interface IGroupMembershipKey extends Record<string, number> {
  userId: number;
  groupId: number;
}
