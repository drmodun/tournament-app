export interface CreateQuizAttemptAnswerDto {
  attemptId: number;
  questionId: number;
  selectedOptionId?: number;
  answer: string;
}

export interface UpdateQuizAttemptAnswerDto {
  selectedOptionId?: number;
  answer?: string;
}
