import { ApiProperty } from '@nestjs/swagger';
import {
  ICreateTeamScore,
  ICreateScoreRequest,
  ICreateMatchResult,
  ISetTeamResult,
  IEndMatchupRequest,
} from '@tournament-app/types';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsPositive,
  Min,
  ValidateNested,
} from 'class-validator';

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
