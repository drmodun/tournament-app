import { ApiProperty } from '@nestjs/swagger';
import {
  IGroupJoinRequestWithUserResponse,
  IGroupJoinRequestWithMiniUserResponse,
  IGroupJoinRequestWithGroupResponse,
  IGroupJoinRequestWithMiniGroupResponse,
} from '@tournament-app/types';
import {
  GroupResponse,
  MiniGroupResponseWithLogo,
} from 'src/group/dto/responses.dto';
import {
  MiniUserResponseWithProfilePicture,
  UserResponse,
} from 'src/users/dto/responses.dto';

export class GroupJoinRequestWithUserResponse
  extends UserResponse
  implements IGroupJoinRequestWithUserResponse
{
  @ApiProperty()
  groupId: number;

  @ApiProperty()
  message: string;
}

export class GroupJoinRequestWithMiniUserResponse
  extends MiniUserResponseWithProfilePicture
  implements IGroupJoinRequestWithMiniUserResponse
{
  @ApiProperty()
  createdAt: Date;
}

export class GroupJoinRequestWithGroupResponse
  extends GroupResponse
  implements IGroupJoinRequestWithGroupResponse
{
  @ApiProperty()
  userId: number;

  @ApiProperty()
  message: string;
}

export class GroupJoinRequestWithMiniGroupResponse
  extends MiniGroupResponseWithLogo
  implements IGroupJoinRequestWithMiniGroupResponse
{
  @ApiProperty()
  createdAt: Date;
}
