import { ApiProperty } from '@nestjs/swagger';
import {} from '@tournament-app/types';
import {
  MiniUserResponseWithProfilePicture,
  UserResponse,
} from 'src/users/dto/responses.dto';
import { GroupResponse } from 'src/group/dto/responses.dto';

export class GroupInviteWithUserResponseDto
  extends UserResponse
  implements GroupInviteWithUserResponseDto
{
  @ApiProperty()
  message: string;

  @ApiProperty()
  groupId: number;
}

export class GroupInviteWithMiniUserResponseDto
  extends MiniUserResponseWithProfilePicture
  implements GroupInviteWithMiniUserResponseDto
{
  @ApiProperty()
  createdAt: Date;
}

export class GroupInviteWithMiniGroupResponseDto
  extends GroupResponse
  implements GroupInviteWithMiniGroupResponseDto
{
  @ApiProperty()
  createdAt: Date;
}

export class GroupInviteWithGroupResponseDto
  extends GroupResponse
  implements GroupInviteWithGroupResponseDto
{
  @ApiProperty()
  message: string;

  @ApiProperty()
  userId: number;
}
