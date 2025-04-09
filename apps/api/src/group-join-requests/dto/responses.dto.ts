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
  @ApiProperty({
    description: 'Group ID',
    example: 456,
    readOnly: true,
  })
  groupId: number;

  @ApiProperty({
    description: 'Message',
    example: 'I want to join this group',
  })
  message: string;
}

export class GroupJoinRequestWithMiniUserResponse
  extends MiniUserResponseWithProfilePicture
  implements IGroupJoinRequestWithMiniUserResponse
{
  @ApiProperty({
    description: 'Date when the request was created',
    example: '2023-01-15T12:30:45Z',
    readOnly: true,
  })
  createdAt: Date;
}

export class GroupJoinRequestWithGroupResponse
  extends GroupResponse
  implements IGroupJoinRequestWithGroupResponse
{
  @ApiProperty({
    description: 'User ID',
    example: 123,
    readOnly: true,
  })
  userId: number;

  @ApiProperty({
    description: 'Message',
    example: 'I want to join this group',
  })
  message: string;
}

export class GroupJoinRequestWithMiniGroupResponse
  extends MiniGroupResponseWithLogo
  implements IGroupJoinRequestWithMiniGroupResponse
{
  @ApiProperty({
    description: 'Date when the request was created',
    example: '2023-01-15T12:30:45Z',
    readOnly: true,
  })
  createdAt: Date;
}
