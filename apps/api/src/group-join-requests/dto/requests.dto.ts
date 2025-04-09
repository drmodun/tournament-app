import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';
import {
  IGroupJoinRequestQuery,
  ICreateGroupJoinRequest,
  IUpdateGroupJoinRequest,
  GroupJoinRequestResponsesEnum,
} from '@tournament-app/types';
import { BaseQuery } from 'src/base/query/baseQuery';

export class GroupJoinRequestQuery
  extends BaseQuery<GroupJoinRequestResponsesEnum>
  implements IGroupJoinRequestQuery
{
  @ApiProperty({ required: false, description: 'User ID', example: 123 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  userId?: number;

  @ApiProperty({ required: false, description: 'Group ID', example: 456 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  groupId?: number;

  @ApiProperty({ required: false, description: 'LFP ID', example: 789 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  relatedLFPId?: number;
}

export class CreateGroupJoinRequestDto implements ICreateGroupJoinRequest {
  @ApiProperty({ description: 'Message', example: 'I want to join this group' })
  @IsString()
  message: string;

  @ApiProperty({ required: false, description: 'LFP ID', example: 789 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  relatedLFPId?: number;
}

export class UpdateGroupJoinRequestDto implements IUpdateGroupJoinRequest {
  @ApiProperty({ required: false, description: 'Message', example: 'I want to join this group' })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiProperty({ required: false, description: 'LFP ID', example: 789 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  relatedLFPId?: number;
}
