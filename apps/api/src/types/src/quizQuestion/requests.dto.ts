import { ICreateQuizOptionDto } from "../quizOption";
import { quizQuestionTypeEnum } from "../enums";

export interface ICreateQuizQuestionDto {
  quizId?: number;
  question: string;
  questionType: quizQuestionTypeEnum;
  order?: number;
  timeLimit?: number;
  points?: number;
  explanation?: string;
  options?: ICreateQuizOptionDto[];
  isImmediateFeedback?: boolean;
  correctAnswers?: string[]; // If not multiple choice
  image: string | null;
}

export interface IUpdateQuizQuestionDto
  extends Partial<ICreateQuizQuestionDto> {}
