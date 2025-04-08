import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ICreateTournamentRequest,
  IUpdateTournamentRequest,
  TournamentQueryType,
  tournamentTypeEnum,
  tournamentLocationEnum,
  tournamentTeamTypeEnum,
} from '@tournament-app/types';
import {
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsNumber,
  Min,
  Max,
  IsDate,
  IsInt,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { BaseQuery } from '../../base/query/baseQuery';
import { TournamentReturnTypesEnumType } from '../types';
import { tournamentLocation, tournamentTeamType } from 'src/db/schema';

export class CreateTournamentRequest implements ICreateTournamentRequest {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @ApiProperty({
    description: 'Name of the tournament',
    example: 'Summer Championship 2023',
    minLength: 3,
    maxLength: 50,
  })
  name: string;

  @IsString()
  @MinLength(10)
  @MaxLength(500)
  @ApiProperty({
    description: 'Detailed description of the tournament',
    example:
      'Annual summer championship tournament with prizes for top 3 teams',
    minLength: 10,
    maxLength: 500,
  })
  description: string;

  @IsString()
  @MinLength(2)
  @MaxLength(2)
  @ApiProperty({
    description: 'Two-letter country code where the tournament is held',
    example: 'US',
    minLength: 2,
    maxLength: 2,
  })
  country: string;

  @IsEnum(tournamentTypeEnum)
  @ApiProperty({
    description: 'Type of tournament',
    enum: tournamentTypeEnum,
    example: 'SINGLE_ELIMINATION',
  })
  tournamentType: tournamentTypeEnum;

  @IsEnum(tournamentLocationEnum)
  @ApiProperty({
    description: 'Location type of the tournament',
    enum: tournamentLocationEnum,
    example: 'ONLINE',
  })
  location: tournamentLocationEnum;

  @IsEnum(tournamentTeamTypeEnum)
  @ApiProperty({
    description: 'Team type for the tournament',
    enum: tournamentTeamTypeEnum,
    example: 'SINGLE',
  })
  tournamentTeamType: tournamentTeamTypeEnum;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({
    description: 'Whether multiple teams per group are allowed',
    example: false,
    default: false,
  })
  isMultipleTeamsPerGroupAllowed?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({
    description: 'Whether fake players are allowed in the tournament',
    example: false,
    default: false,
  })
  isFakePlayersAllowed?: boolean;

  @IsOptional()
  @IsInt()
  @ApiPropertyOptional({
    description: 'ID of the parent tournament if this is a sub-tournament',
    example: 123,
    nullable: true,
  })
  parentTournamentId?: number;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  @ApiPropertyOptional({
    description: 'ID of the conversion rule to apply to this tournament',
    example: 456,
    nullable: true,
  })
  conversionRuleId?: number;

  @IsInt()
  @Min(2)
  @Max(1024)
  @Transform(({ value }) => parseInt(value))
  @ApiProperty({
    description: 'Maximum number of participants allowed in the tournament',
    example: 64,
    minimum: 2,
    maximum: 1024,
  })
  maxParticipants: number;

  @Type(() => Date)
  @IsDate()
  @ApiProperty({
    description: 'Start date and time of the tournament',
    example: '2023-07-01T10:00:00Z',
    type: Date,
  })
  startDate: Date;

  @Type(() => Date)
  @IsDate()
  @ApiProperty({
    description: 'End date and time of the tournament',
    example: '2023-07-15T18:00:00Z',
    type: Date,
  })
  endDate: Date;

  @IsBoolean()
  @ApiProperty({
    description: 'Whether the tournament is public or private',
    example: true,
    default: true,
  })
  isPublic: boolean;

  @IsBoolean()
  @ApiProperty({
    description: 'Whether the tournament is ranked',
    example: true,
    default: true,
  })
  isRanked: boolean;

  @IsInt()
  @Transform(({ value }) => parseInt(value))
  @ApiProperty({
    description: 'ID of the category this tournament belongs to',
    example: 789,
  })
  categoryId: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10000)
  @Transform(({ value }) => parseInt(value))
  @ApiPropertyOptional({
    description: 'Maximum MMR (Matchmaking Rating) allowed for participants',
    example: 2500,
    minimum: 0,
    maximum: 10000,
    nullable: true,
  })
  maximumMMR?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10000)
  @Transform(({ value }) => parseInt(value))
  @ApiPropertyOptional({
    description: 'Minimum MMR (Matchmaking Rating) required for participants',
    example: 1000,
    minimum: 0,
    maximum: 10000,
    nullable: true,
  })
  minimumMMR?: number;

  @ApiProperty({
    description: 'ID of the user creating the tournament',
    example: 321,
  })
  creatorId: number;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  @ApiPropertyOptional({
    description: 'ID of the affiliated group for this tournament',
    example: 654,
    nullable: true,
  })
  affiliatedGroupId?: number;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'External links related to the tournament',
    example: 'https://example.com/tournament-info',
    nullable: true,
  })
  links?: string;

  @IsOptional()
  @IsInt()
  @ApiPropertyOptional({
    description: 'ID of the location where the tournament is held',
    example: 987,
    nullable: true,
  })
  locationId?: number;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'URL to the tournament logo',
    example: 'https://example.com/images/tournament-logo.png',
    nullable: true,
  })
  logo?: string;
}

export class UpdateTournamentRequest implements IUpdateTournamentRequest {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @ApiPropertyOptional()
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  @ApiPropertyOptional()
  description?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(2)
  @ApiPropertyOptional()
  country?: string;

  @IsOptional()
  @IsEnum(tournamentTypeEnum)
  @ApiPropertyOptional({ enum: tournamentTypeEnum })
  tournamentType?: tournamentTypeEnum;

  @IsOptional()
  @IsEnum(tournamentLocationEnum)
  @ApiPropertyOptional({ enum: tournamentLocationEnum })
  location?: tournamentLocationEnum;

  @IsOptional()
  @IsEnum(tournamentTeamTypeEnum)
  @ApiPropertyOptional({ enum: tournamentTeamTypeEnum })
  teamType?: tournamentTeamTypeEnum;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional()
  isMultipleTeamsPerGroupAllowed?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional()
  isFakePlayersAllowed?: boolean;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  @ApiPropertyOptional()
  parentTournamentId?: number;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  @ApiPropertyOptional()
  conversionRuleId?: number;

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
  @Min(2)
  @Max(1024)
  @Transform(({ value }) => parseInt(value))
  @ApiPropertyOptional()
  maxParticipants?: number;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional()
  isPublic?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional()
  isRanked?: boolean;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  @ApiPropertyOptional()
  categoryId?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10000)
  @Transform(({ value }) => parseInt(value))
  @ApiPropertyOptional()
  maximumMMR?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10000)
  @Transform(({ value }) => parseInt(value))
  @ApiPropertyOptional()
  minimumMMR?: number;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  @ApiPropertyOptional()
  creatorId?: number;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  @ApiPropertyOptional()
  affiliatedGroupId?: number;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  links?: string;

  @IsOptional()
  @IsInt()
  @ApiPropertyOptional()
  locationId?: number;
}

export class TournamentQuery
  extends BaseQuery<TournamentReturnTypesEnumType>
  implements TournamentQueryType
{
  @ApiPropertyOptional({
    description: 'Name of the tournament',
    example: 'Summer Championship 2023',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Type of the tournament',
    example: 'SINGLE_ELIMINATION',
    nullable: true,
  })
  @IsOptional()
  @IsEnum(tournamentTypeEnum)
  type?: tournamentTypeEnum;

  @ApiPropertyOptional({
    description: 'Location of the tournament',
    example: 'ONLINE',
    nullable: true,
  })
  @IsOptional()
  @Type(() => tournamentLocation)
  @IsEnum(tournamentLocationEnum)
  location?: tournamentLocationEnum;

  @ApiPropertyOptional({
    description: 'Location ID of the tournament',
    example: 123,
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  locationId?: number;

  @ApiPropertyOptional({
    description: 'Team type of the tournament',
    example: 'SINGLE',
    nullable: true,
  })
  @IsOptional()
  @Type(() => tournamentTeamType)
  @IsEnum(tournamentTeamTypeEnum)
  teamType?: tournamentTeamTypeEnum;

  @ApiPropertyOptional({
    description: 'Start date of the tournament',
    example: '2023-07-01T10:00:00Z',
    nullable: true,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @ApiPropertyOptional({
    description: 'End date of the tournament',
    example: '2023-07-15T18:00:00Z',
    nullable: true,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;

  @ApiPropertyOptional({
    description: 'Whether the tournament is ranked',
    example: true,
    nullable: true,
  })
  @IsOptional()
  @IsBoolean()
  isRanked?: boolean;

  @ApiPropertyOptional({
    description: 'Minimum MMR of the tournament',
    example: 1000,
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  minimumMMR?: number;

  @ApiPropertyOptional({
    description: 'Maximum MMR of the tournament',
    example: 10000,
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  @Max(10000)
  @Transform(({ value }) => parseInt(value))
  maximumMMR?: number;

  @ApiPropertyOptional({
    description: 'Whether multiple teams per group are allowed',
    example: true,
    nullable: true,
  })
  @IsOptional()
  @IsBoolean()
  isMultipleTeamsPerGroupAllowed?: boolean;

  @ApiPropertyOptional({
    description: 'Category ID of the tournament',
    example: 123,
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  categoryId?: number;

  @ApiPropertyOptional({
    description: 'Affiliated group ID of the tournament',
    example: 123,
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  affiliatedGroupId?: number;

  @ApiPropertyOptional({
    description: 'Creator ID of the tournament',
    example: 123,
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  creatorId?: number;

  @ApiPropertyOptional({
    description: 'Minimum participants of the tournament',
    example: 2,
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  @Min(2)
  @Transform(({ value }) => parseInt(value))
  minParticipants?: number;

  @ApiPropertyOptional({
    description: 'Maximum participants of the tournament',
    example: 1024,
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  @Max(1024)
  @Transform(({ value }) => parseInt(value))
  maxParticipants?: number;

  @ApiPropertyOptional({
    description: 'Whether the tournament is public',
    example: true,
    nullable: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isPublic?: boolean;
}
