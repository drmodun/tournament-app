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
  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  userId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  groupId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  relatedLFPId?: number;
}

export class CreateGroupJoinRequestDto implements ICreateGroupJoinRequest {
  @ApiProperty()
  @IsString()
  message: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  relatedLFPId?: number;
}

export class UpdateGroupJoinRequestDto implements IUpdateGroupJoinRequest {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  relatedLFPId?: number;
}
