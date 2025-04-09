import { ApiProperty } from '@nestjs/swagger';
import {
  IQuizResponse,
  IQuizResponseExtended,
  ITagResponse,
} from '@tournament-app/types';
import { Transform } from 'class-transformer';
import { IsString } from 'class-validator';
import {
  QuizQuestionResponse,
  QuizQuestionWithStatistics,
} from './question-response.dto';

export class TagResponse implements ITagResponse {
  @ApiProperty({
    description: 'Unique identifier for the tag',
    example: 1,
    readOnly: true,
  })
  @Transform(({ value }) => value.id)
  id: number;

  @ApiProperty({
    description: 'Name of the tag',
    example: 'Tournament Rules',
    readOnly: true,
  })
  @IsString()
  name: string;
}

export class QuizResponse implements IQuizResponse {
  @ApiProperty({
    description: 'Unique identifier for the quiz',
    example: 123,
    readOnly: true,
  })
  id: number;

  @ApiProperty({
    description: 'Name of the quiz',
    example: 'Tournament Rules Quiz',
    readOnly: true,
  })
  name: string;

  @ApiProperty({
    description: 'Date and time when the quiz becomes available',
    example: '2023-07-01T10:00:00Z',
    readOnly: true,
  })
  startDate: Date;

  @ApiProperty({
    description: 'Total time limit for completing the quiz in seconds',
    example: 1800,
    readOnly: true,
    nullable: true,
  })
  timeLimitTotal?: number | null;

  @ApiProperty({
    description: 'Minimum score required to pass the quiz (percentage)',
    example: 70,
    readOnly: true,
    nullable: true,
  })
  passingScore?: number | null;

  @ApiProperty({
    description: 'Whether users can retake the quiz after completion',
    example: true,
    readOnly: true,
  })
  isRetakeable: boolean;

  @ApiProperty({
    description: 'Whether anonymous users can take the quiz',
    example: false,
    readOnly: true,
    nullable: true,
  })
  isAnonymousAllowed?: boolean;

  @ApiProperty({
    description: 'Detailed description of the quiz',
    example:
      'This quiz covers the rules and regulations for the upcoming tournament',
    readOnly: true,
    nullable: true,
  })
  description?: string | null;

  @ApiProperty({
    description: 'ID of the matchup this quiz is associated with',
    example: 123,
    readOnly: true,
    nullable: true,
  })
  matchupId?: number | null;

  @ApiProperty({
    description: 'ID of the stage this quiz is associated with',
    example: 456,
    readOnly: true,
    nullable: true,
  })
  stageId?: number | null;

  @ApiProperty({
    description: 'URL to the quiz cover image',
    example: 'https://example.com/images/quiz-cover.jpg',
    readOnly: true,
    nullable: true,
  })
  coverImage?: string;

  @ApiProperty({
    description: 'List of tags associated with the quiz',
    type: [TagResponse],
    readOnly: true,
  })
  tags: TagResponse[];

  @ApiProperty({
    description: 'Date when the quiz was created',
    example: '2023-06-15T14:30:00Z',
    readOnly: true,
  })
  createdAt: Date | string;

  @ApiProperty({
    description: 'Date when the quiz was last updated',
    example: '2023-06-20T09:15:00Z',
    readOnly: true,
  })
  updatedAt: Date | string;

  @ApiProperty({
    description: 'ID of the user who created the quiz',
    example: 789,
    readOnly: true,
  })
  authorId: number;
}

export class QuizResponseExtended
  extends QuizResponse
  implements IQuizResponseExtended
{
  @ApiProperty({
    description: 'Total number of attempts made on the quiz',
    example: 50,
    readOnly: true,
  })
  attempts: number;

  @ApiProperty({
    description: 'Average score achieved by all attempts',
    example: 75.5,
    readOnly: true,
  })
  averageScore: number;

  @ApiProperty({
    description: 'Median score achieved by all attempts',
    example: 80,
    readOnly: true,
  })
  medianScore: number;

  @ApiProperty({
    description: 'Percentage of attempts that passed the quiz',
    example: 65.5,
    readOnly: true,
  })
  passingRate: number;

  @ApiProperty({
    description: 'List of questions with their statistics',
    type: [QuizQuestionResponse],
    readOnly: true,
  })
  questions: QuizQuestionWithStatistics[];

  @ApiProperty({
    description: 'Whether questions are presented in random order',
    example: true,
    readOnly: true,
  })
  isRandomizedQuestions: boolean;

  @ApiProperty({
    description: 'Whether feedback is shown immediately after each question',
    example: true,
    readOnly: true,
  })
  isImmediateFeedback: boolean;

  @ApiProperty({
    description: 'Whether this is a test quiz',
    example: false,
    readOnly: true,
  })
  isTest: boolean;
}

export class QuizResponseForAttempt extends QuizResponse {
  @ApiProperty({
    description: 'Total number of attempts made on the quiz',
    example: 50,
    readOnly: true,
  })
  attempts: number;

  @ApiProperty({
    description: 'Average score achieved by all attempts',
    example: 75.5,
    readOnly: true,
  })
  averageScore: number;

  @ApiProperty({
    description: 'Median score achieved by all attempts',
    example: 80,
    readOnly: true,
  })
  medianScore: number;

  @ApiProperty({
    description: 'Percentage of attempts that passed the quiz',
    example: 65.5,
    readOnly: true,
  })
  passingRate: number;

  @ApiProperty({
    description: 'List of questions for the quiz attempt',
    type: [QuizQuestionResponse],
    readOnly: true,
  })
  questions: QuizQuestionResponse[];
}

// Define response types and enums
export enum QuizResponsesEnum {
  BASE = 'BASE',
  EXTENDED = 'EXTENDED',
}

export type QuizResponseEnumType =
  (typeof QuizResponsesEnum)[keyof typeof QuizResponsesEnum];
