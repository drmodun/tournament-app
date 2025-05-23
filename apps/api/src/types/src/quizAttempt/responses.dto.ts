import { questionAnswerStateEnumType } from "../enums";
import {
  IQuizAttemptAnswerResponse,
  IQuizAttemptAnswerWithFeedbackResponse,
} from "../quizAttemptAnswer";

export interface QuizAttemptInProgressResponse {
  id: number;
  quizId: number;
  name: string;
  userId: number;
  startTime: Date | string;
  answers?: IQuizAttemptAnswerResponse[];
  currentQuestion: number;
  answerState: QuizQuestionAnswerState[];
}

export interface QuizQuestionAnswerState {
  id: number;
  order: number;
  type: questionAnswerStateEnumType;
}

export interface PostQuizAttemptResponse extends QuizAttemptInProgressResponse {
  endTime: Date | string | null;
  score: number | null;
  isCompleted: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  answers?: IQuizAttemptAnswerWithFeedbackResponse[];
}

export type QuizAttemptResponseType =
  | QuizAttemptInProgressResponse
  | PostQuizAttemptResponse;

export enum QuizAttemptResponseTypeEnum {
  IN_PROGRESS = "inProgress",
  POST = "post",
}

export interface QuizAttemptLeaderboardResponse {
  id: number;
  userId: number;
  score: number;
  endTime: Date;
  createdAt: Date;
  userName: string;
  userProfilePicture?: string;
  rank: number;
}

export type QuizAttemptResponseTypeEnumType =
  (typeof QuizAttemptResponseTypeEnum)[keyof typeof QuizAttemptResponseTypeEnum];
