import { ApiResponseProperty } from '@nestjs/swagger';
import {
  groupRoleEnumType,
  IMinimalMembershipResponse,
  userRoleEnumType,
} from '@tournament-app/types';
import { MiniUserResponseWithProfilePicture } from 'src/users/dto/responses.dto';

export class MinimalMemberResponse implements IMinimalMembershipResponse {
  @ApiResponseProperty()
  groupId: number;

  @ApiResponseProperty()
  userId: number;

  @ApiResponseProperty()
  role: groupRoleEnumType;
}

export class GroupMembershipResponse {
  @ApiResponseProperty()
  groupId: number;

  @ApiResponseProperty()
  userId: number;

  @ApiResponseProperty({
    type: MiniUserResponseWithProfilePicture,
  })
  user: MiniUserResponseWithProfilePicture;

  @ApiResponseProperty({
  }) // TODO: add resposne for group stuff now
}

export
