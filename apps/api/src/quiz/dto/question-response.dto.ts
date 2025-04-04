import {
  ApiProperty,
  ApiPropertyOptional,
  ApiResponseProperty,
} from '@nestjs/swagger';
import {
  IQuizAnswerWithCountResponse,
  IQuizQuestionExtendedResponse,
  IQuizQuestionResponse,
  IQuizQuestionWithCorrectAnswerAndExplanationResponse,
  IQuizQuestionWithStatistics,
  quizQuestionTypeEnum,
} from '@tournament-app/types';
import {
  QuizOptionResponse,
  QuizOptionWithAnswerCountResponse,
} from './option-response.dto';

export class QuizQuestionResponse implements IQuizQuestionResponse {
  @ApiResponseProperty()
  id: number;

  @ApiResponseProperty()
  name: string;

  @ApiResponseProperty()
  order: number;

  @ApiResponseProperty()
  timeLimit?: number | null;

  @ApiResponseProperty()
  points: number | null;

  @ApiResponseProperty()
  createdAt: Date | string;

  @ApiResponseProperty()
  updatedAt: Date | string;

  @ApiResponseProperty({
    enum: quizQuestionTypeEnum,
  })
  type: quizQuestionTypeEnum;

  @ApiResponseProperty({
    type: [QuizOptionResponse],
  })
  options?: QuizOptionResponse[];

  @ApiResponseProperty()
  image?: string | null;
}

export class QuizQuestionWithCorrectAnswerAndExplanationResponse
  extends QuizQuestionResponse
  implements IQuizQuestionWithCorrectAnswerAndExplanationResponse
{
  @ApiResponseProperty()
  correctAnswers: string[];

  @ApiResponseProperty()
  explanation: string | null;
}

export class QuizQuestionExtendedResponse
  extends QuizQuestionWithCorrectAnswerAndExplanationResponse
  implements IQuizQuestionExtendedResponse
{
  @ApiResponseProperty()
  isImmediateFeedback: boolean;

  @ApiResponseProperty()
  correctAnswers: string[];
}

export class QuizAnswerWithCountResponse
  implements IQuizAnswerWithCountResponse
{
  @ApiResponseProperty()
  answer: string;

  @ApiResponseProperty()
  count: number;
}

export class QuizQuestionWithStatistics
  extends QuizQuestionExtendedResponse
  implements IQuizQuestionWithStatistics
{
  @ApiProperty({
    type: [QuizOptionWithAnswerCountResponse],
  })
  options: QuizOptionWithAnswerCountResponse[];

  @ApiProperty({
    type: [QuizAnswerWithCountResponse],
  })
  answers: QuizAnswerWithCountResponse[];
}
