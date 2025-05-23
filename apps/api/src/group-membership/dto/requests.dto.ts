import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  GroupMembershipResponsesEnum,
  groupRoleEnum,
  groupRoleEnumType,
  IGroupMembershipQueryRequest,
} from '^tournament-app/types';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { BaseQuery } from 'src/base/query/baseQuery';

export class GroupMembershipQuery
  extends BaseQuery<GroupMembershipResponsesEnum>
  implements IGroupMembershipQueryRequest
{
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @IsPositive()
  userId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @IsPositive()
  groupId?: number;

  @ApiPropertyOptional({
    enum: groupRoleEnum,
  })
  @IsOptional()
  @IsEnum(groupRoleEnum)
  @IsString()
  role?: groupRoleEnumType;
}

export class GroupMembershipUpdateRequest {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(groupRoleEnum)
  @IsString()
  role: groupRoleEnumType;
}
