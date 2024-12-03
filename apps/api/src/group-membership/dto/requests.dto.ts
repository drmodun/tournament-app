import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  GroupMembershipResponsesEnum,
  groupRoleEnum,
  groupRoleEnumType,
  IGroupMembershipQueryRequest,
} from '@tournament-app/types';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseQuery } from 'src/base/query/baseQuery';

export class GroupMembershipQuery
  extends BaseQuery<GroupMembershipResponsesEnum>
  implements IGroupMembershipQueryRequest
{
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  userId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  groupId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(groupRoleEnum)
  @IsString()
  role?: groupRoleEnumType;
}
