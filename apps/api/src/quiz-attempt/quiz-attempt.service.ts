import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
  ForbiddenException,
} from '@nestjs/common';
import {
  QuizAttemptResponsesEnum,
  IQuizAttemptResponse,
  IQuizAttemptWithAnswersResponse,
  QuizAttemptResponseEnumType,
} from '@tournament-app/types';
import {
  CreateQuizAnswerRequest,
  CreateQuizAttemptRequest,
  QuizAttemptQuery,
  SubmitQuizAttemptRequest,
  UpdateQuizAnswerRequest,
} from './dto/requests.dto';
import { PaginationOnly } from 'src/base/query/baseQuery';
import { QuizAttemptDrizzleRepository } from './quiz-attempt.repository';
import { QuizService } from 'src/quiz/quiz.service';

@Injectable()
export class QuizAttemptService {
  constructor(
    private readonly repository: QuizAttemptDrizzleRepository,
    private readonly quizService: QuizService,
  ) {}

  async create(
    createQuizAttemptDto: CreateQuizAttemptRequest & { userId: number },
  ) {
    // First, check if the quiz exists
    const quiz = await this.quizService.findOne(createQuizAttemptDto.quizId);

    if (!quiz) {
      throw new NotFoundException(
        `Quiz with ID ${createQuizAttemptDto.quizId} not found`,
      );
    }

    // Check if the quiz allows anonymous users if this is not a logged-in user
    if (!quiz.isAnonymousAllowed && !createQuizAttemptDto.userId) {
      throw new ForbiddenException(
        'This quiz does not allow anonymous attempts',
      );
    }

    // Check if there's already an open attempt for this user and quiz
    const existingAttempt = await this.repository.getQuizAttemptForUser(
      createQuizAttemptDto.userId,
      createQuizAttemptDto.quizId,
    );

    if (existingAttempt) {
      return existingAttempt;
    }

    // Create a new attempt
    const attempt = await this.repository.createQuizAttempt(
      createQuizAttemptDto.userId,
      createQuizAttemptDto.quizId,
    );

    if (!attempt) {
      throw new UnprocessableEntityException('Quiz attempt creation failed');
    }

    return attempt;
  }

  async findAll<TResponseType extends IQuizAttemptResponse>(
    query: QuizAttemptQuery,
  ): Promise<TResponseType[]> {
    const { responseType = QuizAttemptResponsesEnum.BASE, ...queryParams } =
      query;

    const queryFunction = this.repository.getQuery({
      ...queryParams,
      responseType,
    });

    const results = await queryFunction;
    return results as TResponseType[];
  }

  async findOne<
    TResponseType extends
      | IQuizAttemptResponse
      | IQuizAttemptWithAnswersResponse,
  >(
    id: number,
    responseType: QuizAttemptResponseEnumType = QuizAttemptResponsesEnum.BASE,
  ): Promise<TResponseType> {
    const results = await this.repository.getSingleQuery(id, responseType);

    if (!results.length) {
      throw new NotFoundException(`Quiz attempt with ID ${id} not found`);
    }

    return results[0] as TResponseType;
  }

  async submitAttempt(
    id: number,
    submitQuizAttemptDto: SubmitQuizAttemptRequest,
  ) {
    const updatedAttempt = await this.repository.submitQuizAttempt(
      id,
      submitQuizAttemptDto.isSubmitted,
    );

    if (!updatedAttempt) {
      throw new NotFoundException(`Quiz attempt with ID ${id} not found`);
    }

    return updatedAttempt;
  }

  async createAnswer(
    attemptId: number,
    userId: number,
    createAnswerDto: CreateQuizAnswerRequest,
  ) {
    const answer = await this.repository.createAnswer(
      userId,
      attemptId,
      createAnswerDto,
    );

    if (!answer) {
      throw new UnprocessableEntityException('Answer creation failed');
    }

    return answer;
  }

  async updateAnswer(
    answerId: number,
    userId: number,
    updateAnswerDto: UpdateQuizAnswerRequest,
  ) {
    const answer = await this.repository.updateAnswer(
      answerId,
      userId,
      updateAnswerDto,
    );

    if (!answer) {
      throw new NotFoundException(`Answer with ID ${answerId} not found`);
    }

    return answer;
  }

  async getUserAttempts(userId: number, pagination?: PaginationOnly) {
    return this.repository.getUserAttempts(userId, pagination);
  }

  async checkAttempter(attemptId: number, userId: number) {
    const attempt = await this.repository.getSingleQuery(attemptId);

    if (!attempt.length || !attempt[0]) {
      throw new NotFoundException(
        `Quiz attempt with ID ${attemptId} not found`,
      );
    }

    if (attempt[0].userId !== userId) {
      throw new ForbiddenException('You are not the owner of this attempt');
    }
  }
}
