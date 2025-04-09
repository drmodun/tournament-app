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
  @ApiProperty({
    description: 'Unique identifier for the tournament this stage belongs to',
    example: 123,
    type: Number,
  })
  tournamentId: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value))
  @ApiPropertyOptional({
    description: 'ID of the conversion rule to apply to this stage',
    example: 456,
    nullable: true,
  })
  conversionRuleId?: number;

  @IsOptional()
  @IsEnum(stageStatusEnum)
  @ApiPropertyOptional({
    description: 'Current status of the stage',
    enum: stageStatusEnum,
    example: 'SCHEDULED',
    nullable: true,
  })
  stageStatus?: stageStatusEnum;

  @IsOptional()
  @IsEnum(stageTypeEnum)
  @ApiPropertyOptional({
    description: 'Type of the stage',
    enum: stageTypeEnum,
    example: 'SINGLE_ELIMINATION',
    nullable: true,
  })
  stageType?: stageTypeEnum;

  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @ApiProperty({
    description: 'Name of the stage',
    example: 'Playoffs',
    minLength: 3,
    maxLength: 50,
  })
  name: string;

  @IsOptional()
  @IsEnum(tournamentLocationEnum)
  @ApiPropertyOptional({
    description: 'Location type for the stage',
    enum: tournamentLocationEnum,
    example: 'ONLINE',
    nullable: true,
  })
  stageLocation?: tournamentLocationEnum;

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  @ApiPropertyOptional({
    description: 'Detailed description of the stage',
    example: 'Single elimination playoffs with best of 3 matches',
    minLength: 10,
    maxLength: 500,
    nullable: true,
  })
  description?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'URL to the stage logo',
    example: 'https://example.com/logos/playoffs.png',
    nullable: true,
  })
  logo?: string;

  @IsDate()
  @Type(() => Date)
  @ApiProperty({
    description: 'Start date and time of the stage',
    example: '2023-07-01T14:00:00Z',
    type: Date,
  })
  startDate: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  @IsDateGreaterThan('startDate', {
    message: 'End date must be greater than start date',
  })
  @ApiPropertyOptional({
    description: 'End date and time of the stage',
    example: '2023-07-15T18:00:00Z',
    type: Date,
    nullable: true,
  })
  endDate?: Date;

  @IsOptional()
  @IsInt()
  @Min(1)
  @ApiPropertyOptional({
    description: 'ID of the physical location for the stage',
    example: 789,
    minimum: 1,
    nullable: true,
  })
  locationId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @ApiPropertyOptional({
    description: 'Minimum number of players required per team',
    example: 4,
    minimum: 1,
    maximum: 100,
    nullable: true,
  })
  minPlayersPerTeam?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @ApiPropertyOptional({
    description: 'Maximum number of players allowed per team',
    example: 6,
    minimum: 1,
    maximum: 100,
    nullable: true,
  })
  maxPlayersPerTeam?: number;
}

export class UpdateStageRequest implements IUpdateStageDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value))
  @ApiPropertyOptional({
    description: 'ID of the conversion rule to apply to this stage',
    example: 456,
    nullable: true,
  })
  conversionRuleId?: number;

  @IsOptional()
  @IsEnum(stageStatusEnum)
  @ApiPropertyOptional({
    description: 'Current status of the stage',
    enum: stageStatusEnum,
    example: 'IN_PROGRESS',
    nullable: true,
  })
  stageStatus?: stageStatusEnum;

  @IsOptional()
  @IsEnum(stageTypeEnum)
  @ApiPropertyOptional({
    description: 'Type of the stage',
    enum: stageTypeEnum,
    example: 'DOUBLE_ELIMINATION',
    nullable: true,
  })
  stageType?: stageTypeEnum;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @ApiPropertyOptional({
    description: 'Name of the stage',
    example: 'Finals',
    minLength: 3,
    maxLength: 50,
    nullable: true,
  })
  name?: string;

  @IsOptional()
  @IsEnum(tournamentLocationEnum)
  @ApiPropertyOptional({
    description: 'Location type for the stage',
    enum: tournamentLocationEnum,
    example: 'OFFLINE',
    nullable: true,
  })
  stageLocation?: tournamentLocationEnum;

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  @ApiPropertyOptional({
    description: 'Detailed description of the stage',
    example: 'Double elimination finals with best of 5 matches',
    minLength: 10,
    maxLength: 500,
    nullable: true,
  })
  description?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'URL to the stage logo',
    example: 'https://example.com/logos/finals.png',
    nullable: true,
  })
  logo?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @ApiPropertyOptional({
    description: 'ID of the physical location for the stage',
    example: 789,
    minimum: 1,
    nullable: true,
  })
  locationId?: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  @ApiPropertyOptional({
    description: 'Start date and time of the stage',
    example: '2023-07-01T14:00:00Z',
    type: Date,
    nullable: true,
  })
  startDate?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  @ApiPropertyOptional({
    description: 'End date and time of the stage',
    example: '2023-07-15T18:00:00Z',
    type: Date,
    nullable: true,
  })
  endDate?: Date;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value))
  @ApiPropertyOptional({
    description: 'Minimum number of players required per team',
    example: 4,
    minimum: 1,
    maximum: 100,
    nullable: true,
  })
  minPlayersPerTeam?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value))
  @ApiPropertyOptional({
    description: 'Maximum number of players allowed per team',
    example: 6,
    minimum: 1,
    maximum: 100,
    nullable: true,
  })
  maxPlayersPerTeam?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  @Transform(({ value }) => parseInt(value))
  @ApiPropertyOptional({
    description: 'Maximum number of roster changes allowed',
    example: 2,
    minimum: 0,
    maximum: 10,
    nullable: true,
  })
  maxChanges?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  @Transform(({ value }) => parseInt(value))
  @ApiPropertyOptional({
    description: 'Maximum number of substitutes allowed',
    example: 3,
    minimum: 0,
    maximum: 10,
    nullable: true,
  })
  maxSubstitutes?: number;

  @ApiPropertyOptional({
    description: 'Unique identifier for the tournament this stage belongs to',
    example: 123,
    nullable: true,
  })
  tournamentId?: number;
}

export class StageQuery extends BaseQuery {
  @ApiPropertyOptional({
    description: 'Search stages by name',
    example: 'Playoffs',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Filter stages by type',
    enum: stageTypeEnum,
    example: 'SINGLE_ELIMINATION',
    nullable: true,
  })
  @IsOptional()
  @IsEnum(stageTypeEnum)
  stageType?: stageTypeEnum;

  @ApiPropertyOptional({
    description: 'Filter stages by status',
    enum: stageStatusEnum,
    example: 'SCHEDULED',
    nullable: true,
  })
  @IsOptional()
  @IsEnum(stageStatusEnum)
  stageStatus?: stageStatusEnum;

  @ApiPropertyOptional({
    description: 'Filter stages by location type',
    enum: tournamentLocationEnum,
    example: 'ONLINE',
    nullable: true,
  })
  @IsOptional()
  @IsEnum(tournamentLocationEnum)
  stageLocation?: tournamentLocationEnum;

  @ApiPropertyOptional({
    description: 'Filter stages by start date',
    example: '2023-07-01T00:00:00Z',
    type: Date,
    nullable: true,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @ApiPropertyOptional({
    description: 'Filter stages by end date',
    example: '2023-07-15T23:59:59Z',
    type: Date,
    nullable: true,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;

  @ApiPropertyOptional({
    description: 'Filter stages by tournament ID',
    example: 123,
    type: Number,
    nullable: true,
  })
  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  tournamentId?: number;

  @ApiPropertyOptional({
    description: 'Filter stages by minimum players per team',
    example: 4,
    minimum: 1,
    nullable: true,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  minPlayersPerTeam?: number;

  @ApiPropertyOptional({
    description: 'Filter stages by maximum players per team',
    example: 6,
    maximum: 100,
    nullable: true,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Max(100)
  @Transform(({ value }) => parseInt(value))
  maxPlayersPerTeam?: number;
}
