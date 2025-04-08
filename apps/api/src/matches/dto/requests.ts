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
  @ApiProperty({
    description: 'The ID of the roster participating in the match',
    example: 123,
    type: Number,
  })
  rosterId: number;

  @IsNumber()
  @Min(0)
  @ApiProperty({
    description: 'The number of points scored by the team',
    example: 2,
    type: Number,
    minimum: 0,
  })
  points: number;

  @IsBoolean()
  @ApiProperty({
    description: 'Whether this team won the match',
    example: true,
    type: Boolean,
  })
  isWinner: boolean;
}

export class CreateScoreRequestDto implements ICreateScoreRequest {
  @IsNumber()
  @IsPositive()
  @ApiProperty({
    description: 'The round number in the tournament',
    example: 1,
    type: Number,
    minimum: 1,
  })
  roundNumber: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTeamScoreDto)
  @ApiProperty({
    description: 'The scores for each team participating in the round',
    type: [CreateTeamScoreDto],
    example: [
      { rosterId: 123, points: 2, isWinner: true },
      { rosterId: 456, points: 1, isWinner: false },
    ],
  })
  scores: CreateTeamScoreDto[];
}

export class CreateMatchResultDto implements ICreateMatchResult {
  @IsNumber()
  @IsPositive()
  @ApiProperty({
    description: 'The round number in the tournament',
    example: 1,
    type: Number,
    minimum: 1,
  })
  roundNumber: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTeamScoreDto)
  @ApiProperty({
    description: 'The scores for each team participating in the round',
    type: [CreateTeamScoreDto],
    example: [
      { rosterId: 123, points: 2, isWinner: true },
      { rosterId: 456, points: 1, isWinner: false },
    ],
  })
  scores: CreateTeamScoreDto[];
}

export class SetTeamResultDto implements ISetTeamResult {
  @IsNumber()
  @IsPositive()
  @ApiProperty({
    description: 'The ID of the roster participating in the match',
    example: 123,
    type: Number,
  })
  rosterId: number;

  @IsBoolean()
  @ApiProperty({
    description: 'Whether this team won the match',
    example: true,
    type: Boolean,
  })
  isWinner: boolean;
}

export class EndMatchupRequestDto implements IEndMatchupRequest {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateScoreRequestDto)
  @ApiProperty({
    description: 'The scores for each round in the matchup',
    type: [CreateScoreRequestDto],
    example: [
      {
        roundNumber: 1,
        scores: [
          { rosterId: 123, points: 2, isWinner: true },
          { rosterId: 456, points: 1, isWinner: false },
        ],
      },
    ],
  })
  scores: CreateScoreRequestDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SetTeamResultDto)
  @ApiProperty({
    description: 'The final results for each team in the matchup',
    type: [SetTeamResultDto],
    example: [
      { rosterId: 123, isWinner: true },
      { rosterId: 456, isWinner: false },
    ],
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
  @ApiPropertyOptional({
    description: 'The ID of the matchup to filter by',
    example: 789,
    type: Number,
    nullable: true,
  })
  matchupId?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => parseInt(value))
  @ApiPropertyOptional({
    description: 'The ID of the roster to filter by',
    example: 123,
    type: Number,
    nullable: true,
  })
  rosterId?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => parseInt(value))
  @ApiPropertyOptional({
    description: 'The ID of the group to filter by',
    example: 456,
    type: Number,
    nullable: true,
  })
  groupId?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => parseInt(value))
  @ApiPropertyOptional({
    description: 'The ID of the user to filter by',
    example: 321,
    type: Number,
    nullable: true,
  })
  userId?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => parseInt(value))
  @ApiPropertyOptional({
    description: 'The ID of the stage to filter by',
    example: 654,
    type: Number,
    nullable: true,
  })
  stageId?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => parseInt(value))
  @ApiPropertyOptional({
    description: 'The round number to filter by',
    example: 1,
    type: Number,
    nullable: true,
  })
  round?: number;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  @ApiPropertyOptional({
    description: 'Filter by whether the matchup is finished',
    example: true,
    type: Boolean,
    nullable: true,
  })
  isFinished?: boolean;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value ?? undefined)
  @ApiPropertyOptional({
    description: 'The Challonge ID of the matchup to filter by',
    example: '123456789',
    type: String,
    nullable: true,
  })
  challongeMatchupId?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  @ApiPropertyOptional({
    description: 'Filter by whether the matchup has a Challonge ID',
    example: true,
    type: Boolean,
    nullable: true,
  })
  hasChallongeId?: boolean;
}
