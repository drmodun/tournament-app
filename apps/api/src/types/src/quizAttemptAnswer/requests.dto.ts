export interface CreateQuizAttemptAnswerDto {
  attemptId?: number;
  quizQuestionId?: number;
  selectedOptionId?: number;
  answer?: string;
}

export interface UpdateQuizAttemptAnswerDto {
  selectedOptionId?: number;
  answer?: string;
}
