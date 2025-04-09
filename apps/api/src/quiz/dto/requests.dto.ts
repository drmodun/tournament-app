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
  @ApiProperty({
    description: 'Name of the quiz',
    example: 'Tournament Rules Quiz',
    minLength: 1,
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Date and time when the quiz becomes available',
    example: '2023-07-01T10:00:00Z',
    type: Date,
  })
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @ApiPropertyOptional({
    description: 'Total time limit for completing the quiz in seconds',
    example: 1800,
    minimum: 60,
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  @Min(60)
  @Transform(({ value }) => parseInt(value))
  timeLimitTotal?: number | null;

  @ApiPropertyOptional({
    description: 'Minimum score required to pass the quiz (percentage)',
    example: 70,
    minimum: 0,
    maximum: 100,
    nullable: true,
  })
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  @IsOptional()
  @Min(0)
  @Max(100)
  passingScore?: number | null;

  @ApiPropertyOptional({
    description: 'Whether to show feedback immediately after each question',
    example: true,
    nullable: true,
  })
  @Transform(({ value }) => (value ? value === 'true' : undefined))
  @IsBoolean()
  @IsOptional()
  isImmediateFeedback?: boolean | null;

  @ApiPropertyOptional({
    description: 'Whether to randomize the order of questions',
    example: true,
    nullable: true,
  })
  @Transform(({ value }) => (value ? value === 'true' : undefined))
  @IsBoolean()
  @IsOptional()
  isRandomizedQuestions?: boolean | null;

  @ApiPropertyOptional({
    description: 'Whether anonymous users can take the quiz',
    example: false,
  })
  @Transform(({ value }) => (value ? value === 'true' : undefined))
  @IsBoolean()
  @IsOptional()
  isAnonymousAllowed?: boolean;

  @ApiPropertyOptional({
    description: 'Whether users can retake the quiz after completion',
    example: true,
  })
  @Transform(({ value }) => (value ? value === 'true' : undefined))
  @IsBoolean()
  @IsOptional()
  isRetakeable?: boolean;

  @ApiPropertyOptional({
    description: 'Detailed description of the quiz',
    example:
      'This quiz covers the rules and regulations for the upcoming tournament',
    minLength: 10,
    maxLength: 500,
    nullable: true,
  })
  @IsString()
  @IsOptional()
  @MinLength(10)
  @MaxLength(500)
  description?: string | null;

  @ApiPropertyOptional({
    description: 'ID of the matchup this quiz is associated with',
    example: 123,
    nullable: true,
  })
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  @IsOptional()
  matchupId?: number | null;

  @ApiPropertyOptional({
    description: 'ID of the stage this quiz is associated with',
    example: 456,
    nullable: true,
  })
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  @IsOptional()
  stageId?: number | null;

  @ApiPropertyOptional({
    description: 'Whether this is a test quiz',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => (value ? value === 'true' : undefined))
  isTest?: boolean;

  @ApiPropertyOptional({
    description: 'URL to the quiz cover image',
    example: 'https://example.com/images/quiz-cover.jpg',
  })
  @IsString()
  @IsOptional()
  coverImage?: string;

  @ApiPropertyOptional({
    description: 'List of tag IDs associated with the quiz',
    example: [1, 2, 3],
    type: [Number],
  })
  @IsArray()
  @Transform(({ value }) => value.map((tag) => parseInt(tag)))
  @IsNumber({}, { each: true })
  @IsOptional()
  tags: number[];

  @ApiProperty({
    description: 'List of questions for the quiz',
    type: [CreateQuizQuestionDto],
    example: [
      {
        text: 'What is the maximum team size allowed?',
        type: 'MULTIPLE_CHOICE',
        options: [
          { text: '4 players', isCorrect: true },
          { text: '5 players', isCorrect: false },
          { text: '6 players', isCorrect: false },
        ],
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuizQuestionDto)
  questions: CreateQuizQuestionDto[];
}

export class UpdateQuizRequest extends PartialType(CreateQuizRequest) {}

export class QuizQuery extends BaseQuery {
  @ApiPropertyOptional({
    description: 'Search for quizzes by name',
    example: 'Tournament Rules',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Filter quizzes by author ID',
    example: 789,
  })
  @IsNumber()
  @IsOptional()
  authorId?: number;

  @ApiPropertyOptional({
    description: 'Filter quizzes by associated matchup ID',
    example: 123,
  })
  @IsNumber()
  @IsOptional()
  matchupId?: number;

  @ApiPropertyOptional({
    description: 'Filter quizzes by associated stage ID',
    example: 456,
  })
  @IsNumber()
  @IsOptional()
  stageId?: number;

  @ApiPropertyOptional({
    description: 'Filter for test quizzes',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  isTest?: boolean;
}
