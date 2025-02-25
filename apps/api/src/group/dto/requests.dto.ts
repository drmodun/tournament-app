import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ICreateGroupRequest,
  IUpdateGroupRequest,
  IGroupQuery,
  groupFocusEnumType,
  groupTypeEnum,
  groupFocusEnum,
  ICreateFakeGroupRequest,
} from '@tournament-app/types';
import {
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsUrl,
  IsEnum,
  IsInt,
} from 'class-validator';
import { BaseQuery } from '../../base/query/baseQuery';

export class CreateGroupRequest implements ICreateGroupRequest {
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @ApiProperty()
  name: string;

  @IsString()
  @MinLength(2)
  @MaxLength(10)
  @ApiProperty()
  abbreviation: string;

  @IsString()
  @MinLength(3)
  @MaxLength(300)
  @ApiProperty()
  description: string;

  @IsEnum(groupTypeEnum)
  @ApiProperty({ enum: groupTypeEnum })
  type: groupTypeEnum;

  @IsEnum(groupFocusEnum)
  @ApiProperty({ enum: groupFocusEnum })
  focus: groupFocusEnumType;

  @IsUrl()
  @ApiProperty()
  logo: string;

  @IsOptional()
  @IsInt()
  @ApiPropertyOptional()
  locationId?: number;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  country?: string;
}

export class UpdateGroupRequest implements IUpdateGroupRequest {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @ApiPropertyOptional()
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(10)
  @ApiPropertyOptional()
  abbreviation?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(300)
  @ApiPropertyOptional()
  description?: string;

  @IsOptional()
  @IsEnum(groupTypeEnum)
  @ApiPropertyOptional({ enum: groupTypeEnum })
  type?: groupTypeEnum;

  @IsOptional()
  @IsEnum(groupFocusEnum)
  @ApiPropertyOptional({ enum: groupFocusEnum })
  focus?: groupFocusEnum;

  @IsOptional()
  @IsUrl()
  @ApiPropertyOptional()
  logo?: string;

  @IsOptional()
  @IsInt()
  @ApiPropertyOptional()
  locationId?: number; // TODO: add special location specific stuff later

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  country?: string;
}

export class GroupQuery extends BaseQuery implements IGroupQuery {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  abbreviation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(groupTypeEnum)
  type?: groupTypeEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(groupFocusEnum)
  focus?: groupFocusEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  country?: string;
}

export class CreateFakeGroupRequest implements ICreateFakeGroupRequest {
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @ApiProperty()
  name: string;

  @IsString()
  @MinLength(2)
  @MaxLength(10)
  @ApiProperty()
  abbreviation: string;

  @IsUrl()
  @ApiProperty()
  logo: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  country?: string;

  userId: number;
}
