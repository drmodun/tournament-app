import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
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
  @ApiProperty()
  @Transform(({ value }) => value.id)
  id: number;

  @ApiProperty()
  @IsString()
  name: string;
}

export class QuizResponse implements IQuizResponse {
  @ApiResponseProperty()
  id: number;

  @ApiResponseProperty()
  name: string;

  @ApiResponseProperty()
  startDate: Date;

  @ApiResponseProperty()
  timeLimitTotal?: number | null;

  @ApiResponseProperty()
  passingScore?: number | null;

  @ApiResponseProperty()
  isRetakable: boolean;

  @ApiResponseProperty()
  isAnonymousAllowed?: boolean;

  @ApiResponseProperty()
  description?: string | null;

  @ApiResponseProperty()
  matchupId?: number | null;

  @ApiResponseProperty()
  stageId?: number | null;

  @ApiResponseProperty()
  coverImage?: string;

  @ApiResponseProperty({ type: [TagResponse] })
  tags: TagResponse[];

  @ApiResponseProperty()
  createdAt: Date | string;

  @ApiResponseProperty()
  updatedAt: Date | string;

  @ApiResponseProperty()
  authorId: number;
}

export class QuizResponseExtended
  extends QuizResponse
  implements IQuizResponseExtended
{
  @ApiResponseProperty()
  attempts: number;

  @ApiResponseProperty()
  averageScore: number;

  @ApiResponseProperty()
  medianScore: number;

  @ApiResponseProperty()
  passingRate: number;

  @ApiProperty({
    description: 'Quiz questions with statistics',
    type: [QuizQuestionResponse],
  })
  questions: QuizQuestionWithStatistics[];
}

export class QuizResponseForAttempt extends QuizResponse {
  @ApiResponseProperty()
  attempts: number;

  @ApiResponseProperty()
  averageScore: number;

  @ApiResponseProperty()
  medianScore: number;

  @ApiResponseProperty()
  passingRate: number;

  @ApiProperty({
    description: 'Quiz questions with statistics',
    type: [QuizQuestionResponse],
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

// TODO: maybe author response
