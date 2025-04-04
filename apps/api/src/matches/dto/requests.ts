import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ICreateTeamScore,
  ICreateScoreRequest,
  ICreateMatchResult,
  ISetTeamResult,
  IEndMatchupRequest,
  IQueryMatchupRequest,
} from '@tournament-app/types';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { BaseQuery } from 'src/base/query/baseQuery';

export class CreateTeamScoreDto implements ICreateTeamScore {
  @IsNumber()
  @IsPositive()
  @ApiProperty({ description: 'The ID of the roster' })
  rosterId: number;

  @IsNumber()
  @Min(0)
  @ApiProperty({ description: 'The number of points scored' })
  points: number;

  @IsBoolean()
  @ApiProperty({ description: 'Whether this team is the winner' })
  isWinner: boolean;
}

export class CreateScoreRequestDto implements ICreateScoreRequest {
  @IsNumber()
  @IsPositive()
  @ApiProperty({ description: 'The round number' })
  roundNumber: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTeamScoreDto)
  @ApiProperty({
    description: 'The scores for each team',
    type: [CreateTeamScoreDto],
  })
  scores: CreateTeamScoreDto[];
}

export class CreateMatchResultDto implements ICreateMatchResult {
  @IsNumber()
  @IsPositive()
  @ApiProperty({ description: 'The round number' })
  roundNumber: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTeamScoreDto)
  @ApiProperty({
    description: 'The scores for each team',
    type: [CreateTeamScoreDto],
  })
  scores: CreateTeamScoreDto[];
}

export class SetTeamResultDto implements ISetTeamResult {
  @IsNumber()
  @IsPositive()
  @ApiProperty({ description: 'The ID of the roster' })
  rosterId: number;

  @IsBoolean()
  @ApiProperty({ description: 'Whether this team is the winner' })
  isWinner: boolean;
}

export class EndMatchupRequestDto implements IEndMatchupRequest {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateScoreRequestDto)
  @ApiProperty({
    description: 'The scores for each round',
    type: [CreateScoreRequestDto],
  })
  scores: CreateScoreRequestDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SetTeamResultDto)
  @ApiProperty({
    description: 'The results for each team',
    type: [SetTeamResultDto],
  })
  results: SetTeamResultDto[];
}

export class QueryMatchupRequestDto
  extends BaseQuery
  implements IQueryMatchupRequest
{
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => parseInt(value))
  @ApiPropertyOptional({ description: 'The ID of the matchup' })
  matchupId?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => parseInt(value))
  @ApiPropertyOptional({ description: 'The ID of the roster' })
  rosterId?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => parseInt(value))
  @ApiPropertyOptional({ description: 'The ID of the group' })
  groupId?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => parseInt(value))
  @ApiPropertyOptional({ description: 'The ID of the user' })
  userId?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => parseInt(value))
  @ApiPropertyOptional({ description: 'The ID of the stage' })
  stageId?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => parseInt(value))
  @ApiPropertyOptional({ description: 'The round number' })
  round?: number;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  @ApiPropertyOptional({ description: 'Whether the matchup is finished' })
  isFinished?: boolean;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value ?? undefined)
  @ApiPropertyOptional({ description: 'The Challonge ID of the matchup' })
  challongeMatchupId?: string;
}
