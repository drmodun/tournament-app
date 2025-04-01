import { ICreateQuizQuestionDto } from "src/quizQuestion";

export interface CreateQuizDto {
  name: string;
  startDate: Date | string;
  timeLimitTotal?: number | null; // Time limit (in seconds)
  passingScore?: number | null;
  maxAttempts?: number | null;
  isImmediateFeedback?: boolean | null;
  isRandomizedQuestions?: boolean | null;
  isAnonymousAllowed?: boolean;
  isRetakeable?: boolean;
  description?: string | null;
  matchupId?: number | null;
  stageId?: number | null;
  isTest?: boolean;
  coverImage?: string;
  tags: number[];
  questions: ICreateQuizQuestionDto[];
}

export interface UpdateQuizDto extends Partial<CreateQuizDto> {}
