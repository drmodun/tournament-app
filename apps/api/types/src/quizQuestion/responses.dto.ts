import { quizQuestionTypeEnum } from "src/enums";
import {
  IQuizOptionResponse,
  IQuizOptionWithAnswerCountResponse,
} from "src/quizOption";

export interface IQuizQuestionResponse {
  name: string;
  timeLimit?: number;
  points?: number;
  id: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  type: quizQuestionTypeEnum;
  options?: IQuizOptionResponse[];
  image?: string;
}

export interface IQuizQuestionWithCorrectAnswerAndExplanationResponse
  extends IQuizQuestionResponse {
  correctAnswers: string[];
  explanation: string | null;
}

export interface IQuizQuestionExtendedResponse
  extends IQuizQuestionWithCorrectAnswerAndExplanationResponse {
  isImmediateFeedback: boolean;
  correctAnswers: string[];
}

export interface IQuizAnswerWithCountResponse {
  answer: string;
  count: number;
}

export interface IQuizQuestionWithStatistics
  extends IQuizQuestionExtendedResponse {
  options: IQuizOptionWithAnswerCountResponse[];
  answers: IQuizAnswerWithCountResponse[];
}

export type QuizQuestionResponseType =
  | IQuizQuestionResponse
  | IQuizQuestionWithCorrectAnswerAndExplanationResponse
  | IQuizQuestionExtendedResponse
  | IQuizQuestionWithStatistics;

export enum QuizQuestionResponseEnum {
  BASE = "base",
  WITH_CORRECT_ANSWER_AND_EXPLANATION = "withCorrectAnswerAndExplanation",
  EXTENDED = "extended",
  WITH_STATISTICS = "withStatistics",
}

export type QuizQuestionResponseEnumType =
  (typeof QuizQuestionResponseEnum)[keyof typeof QuizQuestionResponseEnum];
