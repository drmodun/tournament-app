export interface ICreateQuizOptionDto {
  questionId?: number;
  option: string;
  isCorrect: boolean;
}

export interface IUpdateQuizOptionDto extends Partial<ICreateQuizOptionDto> {}
