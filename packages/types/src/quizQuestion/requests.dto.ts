import { ICreateQuizOptionDto } from "src/quizOption";
import { quizQuestionTypeEnum } from "../enums";

export interface ICreateQuizQuestionDto {
  quizId: number;
  question: string;
  questionType: quizQuestionTypeEnum;
  order?: number;
  timeLimit: number | null;
  points?: number | null;
  explanation?: string | null;
  options?: ICreateQuizOptionDto[];
  isImmediateFeedback?: boolean;
  correctAnswers?: string[]; // If not multiple choice
  image: string | null;
}

export interface UpdateQuizQuestionDto
  extends Partial<ICreateQuizQuestionDto> {}
