import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsPositive } from 'class-validator';
import {
  IFollowerQueryRequest,
  FollowerResponsesEnum,
} from '@tournament-app/types';
import { BaseQuery } from 'src/base/query/baseQuery';

export class FollowerQuery
  extends BaseQuery<FollowerResponsesEnum>
  implements IFollowerQueryRequest
{
  @ApiPropertyOptional({
    description: 'User ID',
    example: 123,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @IsPositive()
  userId?: number;
  
  @ApiPropertyOptional({
    description: 'Follower ID',
    example: 456,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @IsPositive()
  followerId?: number;
}
