import { ApiProperty } from '@nestjs/swagger';
import {
  IFollowerMiniResponse,
  IFollowerResponse,
} from '@tournament-app/types';
import { MiniUserResponse, UserResponse } from 'src/users/dto/responses.dto';

export class FollowerMiniResponse
  extends MiniUserResponse
  implements IFollowerMiniResponse
{
  @ApiProperty({
    description: 'Date when the follower was created',
    example: '2023-01-15T12:30:45Z',
    readOnly: true,
  })
  createdAt: Date;
}

export class FollowerResponse
  extends UserResponse
  implements IFollowerResponse
{
  @ApiProperty({
    description: 'Date when the follower was created',
    example: '2023-01-15T12:30:45Z',
    readOnly: true,
  })
  createdAt: Date; // This marks the followed at date
}
