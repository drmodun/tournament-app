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
  @ApiProperty({ description: 'Message', example: 'I want to join this group' })
  message: string;

  @ApiProperty({ description: 'Group ID', example: 456 })
  groupId: number;
}

export class GroupInviteWithMiniUserResponseDto
  extends MiniUserResponseWithProfilePicture
  implements GroupInviteWithMiniUserResponseDto
{
  @ApiProperty({ description: 'Date when the invite was created', example: '2023-01-15T12:30:45Z', readOnly: true } )
  createdAt: Date;
}

export class GroupInviteWithMiniGroupResponseDto
  extends GroupResponse
  implements GroupInviteWithMiniGroupResponseDto
{
  @ApiProperty({ description: 'Date when the invite was created', example: '2023-01-15T12:30:45Z', readOnly: true } )
  createdAt: Date;
}

export class GroupInviteWithGroupResponseDto
  extends GroupResponse
  implements GroupInviteWithGroupResponseDto
{
  @ApiProperty({ description: 'Message', example: 'I want to join this group', readOnly: true })
  message: string;

  @ApiProperty({ description: 'User ID', example: 123, readOnly: true })
  userId: number;
}
