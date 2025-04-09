import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ICreateRosterMemberRequest,
  ICreateRosterRequest,
  RosterResponsesEnum,
} from '@tournament-app/types';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsPositive,
  ValidateNested,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { BaseQuery } from 'src/base/query/baseQuery';
import 'reflect-metadata';

export class CreateRosterMemberDto implements ICreateRosterMemberRequest {
  @ApiProperty({
    description: 'The ID of the user to add to the roster',
    example: 123,
    type: Number,
  })
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => Number(value))
  userId: number;

  @ApiProperty({
    description: 'Whether the user is a substitute player',
    example: false,
    default: false,
    type: Boolean,
  })
  @Transform(({ value }) => (value ? value === 'true' : false))
  @IsBoolean()
  isSubstitute: boolean = false;
}

export class CreateRosterDto implements ICreateRosterRequest {
  @ApiProperty({
    description: 'List of members to add to the roster',
    type: [CreateRosterMemberDto],
    example: [
      { userId: 123, isSubstitute: false },
      { userId: 456, isSubstitute: true },
    ],
  })
  @Type(() => CreateRosterMemberDto)
  @ValidateNested({ each: true })
  members: CreateRosterMemberDto[];
}

export class QueryRosterDto extends BaseQuery<RosterResponsesEnum> {
  @ApiPropertyOptional({
    description: 'Filter rosters by stage ID',
    example: 789,
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => Number(value))
  stageId?: number;

  @ApiPropertyOptional({
    description: 'Filter rosters by participation ID',
    example: 456,
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => Number(value))
  participationId?: number;

  @ApiPropertyOptional({
    description: 'Filter rosters by group ID',
    example: 321,
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => Number(value))
  groupId?: number;

  @ApiPropertyOptional({
    description: 'Filter rosters by user ID',
    example: 123,
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => Number(value))
  userId?: number;

  @ApiPropertyOptional({
    description: 'Filter rosters by substitute status',
    example: true,
    type: Boolean,
  })
  @IsOptional()
  @Transform(({ value }) => (value ? value === 'true' : undefined))
  @IsBoolean()
  isSubstitute?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by specific roster ID',
    example: 654,
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => Number(value))
  rosterId?: number;

  @ApiPropertyOptional({
    description: 'Filter by specific member ID',
    example: 987,
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => Number(value))
  memberId?: number;
}
