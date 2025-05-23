export interface IQuizAttemptAnswerResponse {
  id: number;
  submittedAt: Date | string;
  selectedOptionId?: number;
  answer?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface IQuizAttemptAnswerWithFeedbackResponse
  extends IQuizAttemptAnswerResponse {
  isCorrect: boolean | null;
  explanation: string | null;
}

export enum IQuizAttemptAnswerEnum {
  BASE = "base",
  WITH_FEEDBACK = "withFeedback",
}

export type QuizAttemptAnswerResponseType =
  | IQuizAttemptAnswerResponse
  | IQuizAttemptAnswerWithFeedbackResponse;

export type IQuizAttemptAnswerResponseTypeEnumType =
  (typeof IQuizAttemptAnswerEnum)[keyof typeof IQuizAttemptAnswerEnum];
