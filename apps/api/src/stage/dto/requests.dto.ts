import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsEnum,
  IsInt,
  IsDate,
  Min,
  Max,
} from 'class-validator';
import {
  ICreateStageDto,
  IUpdateStageDto,
  stageStatusEnum,
  stageTypeEnum,
  tournamentLocationEnum,
} from '@tournament-app/types';
import { BaseQuery } from '../../base/query/baseQuery';
import { IsDateGreaterThan } from 'src/base/decorators/isDateGreaterThan';

export class CreateStageRequest implements ICreateStageDto {
  tournamentId: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value))
  @ApiPropertyOptional()
  conversionRuleId?: number;

  @IsOptional()
  @IsEnum(stageStatusEnum)
  @ApiPropertyOptional({ enum: stageStatusEnum })
  stageStatus?: stageStatusEnum;

  @IsOptional()
  @IsEnum(stageTypeEnum)
  @ApiPropertyOptional({ enum: stageTypeEnum })
  stageType?: stageTypeEnum;

  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @ApiProperty()
  name: string;

  @IsOptional()
  @IsEnum(tournamentLocationEnum)
  @ApiPropertyOptional({ enum: tournamentLocationEnum })
  stageLocation?: tournamentLocationEnum;

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  @ApiPropertyOptional()
  description?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  logo?: string;

  @IsDate()
  @Type(() => Date)
  @ApiProperty()
  startDate: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  @IsDateGreaterThan('startDate', {
    message: 'End date must be greater than start date',
  })
  @ApiPropertyOptional()
  endDate?: Date;

  @IsOptional()
  @IsInt()
  @Min(1)
  @ApiPropertyOptional()
  locationId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @ApiPropertyOptional()
  minPlayersPerTeam?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @ApiPropertyOptional()
  maxPlayersPerTeam?: number;
}

export class UpdateStageRequest implements IUpdateStageDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value))
  @ApiPropertyOptional()
  conversionRuleId?: number;

  @IsOptional()
  @IsEnum(stageStatusEnum)
  @ApiPropertyOptional({ enum: stageStatusEnum })
  stageStatus?: stageStatusEnum;

  @IsOptional()
  @IsEnum(stageTypeEnum)
  @ApiPropertyOptional({ enum: stageTypeEnum })
  stageType?: stageTypeEnum;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @ApiPropertyOptional()
  name?: string;

  @IsOptional()
  @IsEnum(tournamentLocationEnum)
  @ApiPropertyOptional({ enum: tournamentLocationEnum })
  stageLocation?: tournamentLocationEnum;

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  @ApiPropertyOptional()
  description?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  logo?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @ApiPropertyOptional()
  locationId?: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  @ApiPropertyOptional()
  startDate?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  @ApiPropertyOptional()
  endDate?: Date;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value))
  @ApiPropertyOptional()
  minPlayersPerTeam?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value))
  @ApiPropertyOptional()
  maxPlayersPerTeam?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  @Transform(({ value }) => parseInt(value))
  @ApiPropertyOptional()
  maxChanges?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  @Transform(({ value }) => parseInt(value))
  @ApiPropertyOptional()
  maxSubstitutes?: number;

  tournamentId?: number;
}

export class StageQuery extends BaseQuery {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(stageTypeEnum)
  stageType?: stageTypeEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(stageStatusEnum)
  stageStatus?: stageStatusEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(tournamentLocationEnum)
  stageLocation?: tournamentLocationEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  tournamentId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  minPlayersPerTeam?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Max(100)
  @Transform(({ value }) => parseInt(value))
  maxPlayersPerTeam?: number;
}
