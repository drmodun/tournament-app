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
  @ApiProperty()
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => Number(value))
  userId: number;

  @ApiProperty()
  @Transform(({ value }) => (value ? value === 'true' : undefined))
  @IsBoolean()
  isSubstitute: boolean = false;
}

export class CreateRosterDto implements ICreateRosterRequest {
  @ApiProperty()
  @Type(() => CreateRosterMemberDto)
  @ValidateNested({ each: true })
  members: CreateRosterMemberDto[];
}

export class QueryRosterDto extends BaseQuery<RosterResponsesEnum> {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => Number(value))
  stageId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => Number(value))
  participationId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => Number(value))
  groupId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => Number(value))
  userId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => (value ? value === 'true' : undefined))
  @IsBoolean()
  isSubstitute?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => Number(value))
  rosterId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => Number(value))
  memberId?: number;
}
