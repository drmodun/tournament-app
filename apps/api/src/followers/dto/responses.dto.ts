import { ApiProperty } from '@nestjs/swagger';
import {
  IFollowerMiniResponse,
  IFollowerResponse,
} from '^tournament-app/types';
import { MiniUserResponse, UserResponse } from 'src/users/dto/responses.dto';

export class FollowerMiniResponse
  extends MiniUserResponse
  implements IFollowerMiniResponse
{
  @ApiProperty()
  createdAt: Date;
}

export class FollowerResponse
  extends UserResponse
  implements IFollowerResponse
{
  @ApiProperty()
  createdAt: Date; // This marks the followed at date
}
