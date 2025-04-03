import { IQuizQuestionWithStatistics } from "src/quizQuestion";

export interface ITagResponse {
  id: number;
  name: string;
}

export interface IQuizResponse {
  name: string;
  startDate: Date | string;
  timeLimitTotal?: number | null; // Time limit (in seconds)
  passingScore?: number | null; // Percentage
  isRetakable: boolean;
  isAnonymousAllowed?: boolean;
  description?: string | null;
  matchupId?: number | null;
  stageId?: number | null;
  coverImage?: string;
  tags: ITagResponse[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface IQuizResponseExtended extends IQuizResponse {
  attempts: number;
  averageScore: number;
  medianScore: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  passingRate: number;
  questions: IQuizQuestionWithStatistics[];
}

//TODO: for leaderboard scoring implement other types later
