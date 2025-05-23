export interface IQuizOptionResponse {
  id: number;
  option: string;
}

export interface IQuizOptionExtendedResponse extends IQuizOptionResponse {
  isCorrect: boolean;
  createdAt: Date | string;
}

export interface IQuizOptionWithAnswerCountResponse
  extends IQuizOptionExtendedResponse {
  answerCount: number;
}

export enum QuizOptionResponseEnum {
  BASE = "base",
  EXTENDED = "extended",
  WITH_ANSWER_COUNT = "withAnswerCount",
}

export type QuizOptionResponseType =
  | IQuizOptionResponse
  | IQuizOptionExtendedResponse
  | IQuizOptionWithAnswerCountResponse;

export type QuizOptionResponseEnumType =
  (typeof QuizOptionResponseEnum)[keyof typeof QuizOptionResponseEnum];
