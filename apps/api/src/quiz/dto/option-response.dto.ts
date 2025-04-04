import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import {
  IQuizOptionResponse,
  IQuizOptionWithAnswerCountResponse,
} from '@tournament-app/types';

export class QuizOptionResponse implements IQuizOptionResponse {
  @ApiProperty({ description: 'Option ID' })
  id: number;

  @ApiResponseProperty()
  order?: number;

  @ApiResponseProperty()
  option: string;
}

export class QuizOptionWithAnswerCountResponse
  extends QuizOptionResponse
  implements IQuizOptionWithAnswerCountResponse
{
  @ApiResponseProperty()
  answerCount: number;

  @ApiResponseProperty()
  createdAt: Date | string;
  @ApiResponseProperty()
  isCorrect: boolean;
}
