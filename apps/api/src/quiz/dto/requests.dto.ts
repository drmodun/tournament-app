import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsArray,
  ValidateNested,
  IsDate,
  Min,
  Max,
  MinLength,
  MaxLength,
} from 'class-validator';
import { BaseQuery } from 'src/base/query/baseQuery';
import { CreateQuizDto } from '@tournament-app/types';
import { CreateQuizQuestionDto } from './question.dto';

export class CreateQuizRequest implements CreateQuizDto {
  @ApiProperty({ description: 'Quiz name' })
  @IsString()
  name: string;

  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(60)
  @Transform(({ value }) => parseInt(value))
  timeLimitTotal?: number | null;

  @ApiPropertyOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  @IsOptional()
  @Min(0)
  @Max(100)
  passingScore?: number | null;

  @ApiPropertyOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  @IsOptional()
  @Min(1)
  maxAttempts?: number | null;

  @ApiPropertyOptional()
  @Transform(({ value }) => (value ? value === 'true' : undefined))
  @IsBoolean()
  @IsOptional()
  isImmediateFeedback?: boolean | null;

  @ApiPropertyOptional()
  @Transform(({ value }) => (value ? value === 'true' : undefined))
  @IsBoolean()
  @IsOptional()
  isRandomizedQuestions?: boolean | null;

  @ApiPropertyOptional()
  @Transform(({ value }) => (value ? value === 'true' : undefined))
  @IsBoolean()
  @IsOptional()
  isAnonymousAllowed?: boolean;

  @ApiPropertyOptional()
  @Transform(({ value }) => (value ? value === 'true' : undefined))
  @IsBoolean()
  @IsOptional()
  isRetakeable?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MinLength(10)
  @MaxLength(500)
  description?: string | null;

  @ApiPropertyOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  @IsOptional()
  matchupId?: number | null;

  @ApiPropertyOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  @IsOptional()
  stageId?: number | null;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => (value ? value === 'true' : undefined))
  isTest?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  coverImage?: string;

  @IsArray()
  @Transform(({ value }) => value.map((tag) => parseInt(tag)))
  @IsNumber({}, { each: true })
  @IsOptional()
  tags: number[];

  @ApiProperty({ description: 'Quiz questions', type: [CreateQuizQuestionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuizQuestionDto)
  questions: CreateQuizQuestionDto[];
}

export class UpdateQuizRequest extends PartialType(CreateQuizRequest) {}

export class QuizQuery extends BaseQuery {
  @ApiPropertyOptional({ description: 'Quiz name search' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Created by user ID' })
  @IsNumber()
  @IsOptional()
  authorId?: number;

  @ApiPropertyOptional({ description: 'Associated matchup ID' })
  @IsNumber()
  @IsOptional()
  matchupId?: number;

  @ApiPropertyOptional({ description: 'Associated stage ID' })
  @IsNumber()
  @IsOptional()
  stageId?: number;

  @ApiPropertyOptional({ description: 'Is test quiz' })
  @IsBoolean()
  @IsOptional()
  isTest?: boolean;
}
