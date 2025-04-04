import {
  IQuizQuestionResponse,
  IQuizQuestionWithStatistics,
} from "src/quizQuestion";
import { IUserResponse } from "src/user/responses.dto";

export interface ITagResponse {
  id: number;
  name: string;
}

export interface IQuizResponse {
  name: string;
  startDate: Date | string;
  timeLimitTotal?: number | null; // Time limit (in seconds)
  passingScore?: number | null; // Percentage
  isRetakable: boolean;
  isAnonymousAllowed?: boolean;
  description?: string | null;
  matchupId?: number | null;
  stageId?: number | null;
  coverImage?: string;
  tags: ITagResponse[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface IQuizResponseExtended extends IQuizResponse {
  attempts: number;
  averageScore: number;
  medianScore: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  passingRate: number;
  questions: IQuizQuestionWithStatistics[];
}

export interface IQuizResponseForAttempt extends IQuizResponse {
  attempts: number;
  averageScore: number;
  medianScore: number;
  passingRate: number;
  questions: IQuizQuestionResponse[];
}

export interface IQuizResponseWithAuthor extends IQuizResponse {
  author: IUserResponse;
}

export type BaseQuizResponse =
  | IQuizResponse
  | IQuizResponseWithAuthor
  | IQuizResponseExtended;

export enum QuizResponsesEnum {
  BASE = "BASE",
  EXTENDED = "EXTENDED",
  WITH_AUTHOR = "WITH_AUTHOR",
  FOR_ATTEMPT = "FOR_ATTEMPT",
}

export type QuizReturnTypesEnumType =
  (typeof QuizResponsesEnum)[keyof typeof QuizResponsesEnum];

//TODO: for leaderboard scoring implement other types later

export interface IQuizAnswerResponse {
  id: number;
  isFinal: boolean;
  isCorrect: boolean;
  userId: number;
  quizAttemptId: number;
  quizQuestionId: number;
  answer: string;
  selectedOptionId?: number;
  createdAt: Date;
}

export interface IQuizAttemptResponse {
  id: number;
  userId: number;
  quizId: number;
  currentQuestion: number;
  endTime?: Date;
  score: number;
  isSubmitted: boolean;
  createdAt: Date;
  quiz?: IQuizResponse;
}

export interface IQuizAttemptWithAnswersResponse extends IQuizAttemptResponse {
  answers: IQuizAnswerResponse[];
}

export enum QuizAttemptResponsesEnum {
  BASE = "base",
  WITH_ANSWERS = "withAnswers",
}

export type QuizAttemptResponseEnumType =
  (typeof QuizAttemptResponsesEnum)[keyof typeof QuizAttemptResponsesEnum];
