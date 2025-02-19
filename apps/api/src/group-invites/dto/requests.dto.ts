import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';
import {
  GroupInviteResponsesEnum,
  ICreateGroupInviteDto,
  IGroupInviteQuery,
  IUpdateGroupInviteDto,
} from '@tournament-app/types';
import { BaseQuery } from 'src/base/query/baseQuery';

export class GroupInviteQuery
  extends BaseQuery<GroupInviteResponsesEnum>
  implements IGroupInviteQuery
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

export class CreateGroupInviteDto implements ICreateGroupInviteDto {
  @ApiProperty()
  @IsString()
  message: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  relatedLFPId?: number;
}

export class UpdateGroupInviteDto implements IUpdateGroupInviteDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  relatedLFPId?: number;
}
