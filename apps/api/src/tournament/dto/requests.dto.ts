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
import { Type } from 'class-transformer';
import { BaseQuery } from '../../base/query/baseQuery';

export class CreateTournamentRequest implements ICreateTournamentRequest {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @ApiProperty()
  name: string;

  @IsString()
  @MinLength(10)
  @MaxLength(500)
  @ApiProperty()
  description: string;

  @IsString()
  @MinLength(2)
  @MaxLength(2)
  @ApiProperty()
  country: string;

  @IsEnum(tournamentTypeEnum)
  @ApiProperty({ enum: tournamentTypeEnum })
  tournamentType: tournamentTypeEnum;

  @IsEnum(tournamentLocationEnum)
  @ApiProperty({ enum: tournamentLocationEnum })
  location: tournamentLocationEnum;

  @IsEnum(tournamentTeamTypeEnum)
  @ApiProperty({ enum: tournamentTeamTypeEnum })
  teamType: tournamentTeamTypeEnum;

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
  @ApiPropertyOptional()
  parentTournamentId?: number;

  @IsOptional()
  @IsInt()
  @ApiPropertyOptional()
  conversionRuleId?: number;

  @IsInt()
  @Min(2)
  @Max(1024)
  @ApiProperty()
  maxParticipants: number;

  @Type(() => Date)
  @IsDate()
  @ApiProperty()
  startDate: Date;

  @Type(() => Date)
  @IsDate()
  @ApiProperty()
  endDate: Date;

  @IsBoolean()
  @ApiProperty()
  isPublic: boolean;

  @IsBoolean()
  @ApiProperty()
  isRanked: boolean;

  @IsInt()
  @ApiProperty()
  categoryId: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10000)
  @ApiPropertyOptional()
  maximumMMR?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10000)
  @ApiPropertyOptional()
  minimumMMR?: number;

  @IsInt()
  @ApiProperty()
  creatorId: number;

  @IsOptional()
  @IsInt()
  @ApiPropertyOptional()
  affiliatedGroupId?: number;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  links?: string;
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
  @ApiPropertyOptional()
  parentTournamentId?: number;

  @IsOptional()
  @IsInt()
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
  @ApiPropertyOptional()
  categoryId?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10000)
  @ApiPropertyOptional()
  maximumMMR?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10000)
  @ApiPropertyOptional()
  minimumMMR?: number;

  @IsOptional()
  @IsInt()
  @ApiPropertyOptional()
  creatorId?: number;

  @IsOptional()
  @IsInt()
  @ApiPropertyOptional()
  affiliatedGroupId?: number;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  links?: string;
}

export class TournamentQuery extends BaseQuery implements TournamentQueryType {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(tournamentTypeEnum)
  type?: tournamentTypeEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(tournamentLocationEnum)
  location?: tournamentLocationEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(tournamentTeamTypeEnum)
  teamType?: tournamentTeamTypeEnum;

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
  @IsBoolean()
  isRanked?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumMMR?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Max(10000)
  maximumMMR?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isMultipleTeamsPerGroupAllowed?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  categoryId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  affiliatedGroupId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  creatorId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(2)
  minParticipants?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Max(1024)
  maxParticipants?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
