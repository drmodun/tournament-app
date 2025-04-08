import { ApiResponseProperty } from '@nestjs/swagger';
import {
  IQuizAnswerResponse,
  IQuizAttemptResponse,
  IQuizAttemptWithAnswersResponse,
} from '@tournament-app/types';
import { QuizResponse } from 'src/quiz/dto/responses.dto';

export class QuizAnswerResponse implements IQuizAnswerResponse {
  @ApiResponseProperty()
  id: number;

  @ApiResponseProperty()
  isFinal: boolean;

  @ApiResponseProperty()
  isCorrect: boolean;

  @ApiResponseProperty()
  userId: number;

  @ApiResponseProperty()
  quizAttemptId: number;

  @ApiResponseProperty()
  quizQuestionId: number;

  @ApiResponseProperty()
  answer: string;

  @ApiResponseProperty()
  selectedOptionId?: number;

  @ApiResponseProperty()
  createdAt: Date;
}

export class QuizAttemptResponse implements IQuizAttemptResponse {
  @ApiResponseProperty()
  id: number;

  @ApiResponseProperty()
  userId: number;

  @ApiResponseProperty()
  quizId: number;

  @ApiResponseProperty()
  currentQuestion: number;

  @ApiResponseProperty()
  endTime?: Date;

  @ApiResponseProperty()
  score: number;

  @ApiResponseProperty()
  isSubmitted: boolean;

  @ApiResponseProperty()
  createdAt: Date;

  @ApiResponseProperty({ type: QuizResponse })
  quiz?: QuizResponse;
}

export class QuizAttemptWithAnswersResponse
  extends QuizAttemptResponse
  implements IQuizAttemptWithAnswersResponse
{
  @ApiResponseProperty({ type: [QuizAnswerResponse] })
  answers: QuizAnswerResponse[];
}

export class QuizLeaderboardEntry {
  @ApiResponseProperty()
  id: number;

  @ApiResponseProperty()
  userId: number;

  @ApiResponseProperty()
  score: number;

  @ApiResponseProperty()
  endTime: Date;

  @ApiResponseProperty()
  createdAt: Date;

  @ApiResponseProperty()
  userName: string;

  @ApiResponseProperty()
  userProfilePicture?: string;

  @ApiResponseProperty()
  rank: number;
}

export class QuizLeaderboardResponse {
  @ApiResponseProperty({ type: [QuizLeaderboardEntry] })
  results: QuizLeaderboardEntry[];

  @ApiResponseProperty()
  metadata: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}
