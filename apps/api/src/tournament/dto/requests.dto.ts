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
  tournamentTeamType: tournamentTeamTypeEnum;

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
  @Transform(({ value }) => parseInt(value))
  @ApiPropertyOptional()
  conversionRuleId?: number;

  @IsInt()
  @Min(2)
  @Max(1024)
  @Transform(({ value }) => parseInt(value))
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
  @Transform(({ value }) => parseInt(value))
  @ApiProperty()
  categoryId: number;

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

  creatorId: number;

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

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
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
  @Type(() => tournamentLocation)
  @IsEnum(tournamentLocationEnum)
  location?: tournamentLocationEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  locationId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => tournamentTeamType)
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
  @Transform(({ value }) => parseInt(value))
  minimumMMR?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Max(10000)
  @Transform(({ value }) => parseInt(value))
  maximumMMR?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isMultipleTeamsPerGroupAllowed?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  categoryId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  affiliatedGroupId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  creatorId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(2)
  @Transform(({ value }) => parseInt(value))
  minParticipants?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Max(1024)
  @Transform(({ value }) => parseInt(value))
  maxParticipants?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isPublic?: boolean;
}
