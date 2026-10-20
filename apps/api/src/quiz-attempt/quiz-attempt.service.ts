import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import {
  QuizAttemptResponsesEnum,
  IQuizAttemptResponse,
  IQuizAttemptWithAnswersResponse,
  QuizAttemptResponseEnumType,
  CreateQuizAttemptDto,
} from '@tournament-app/types';
import {
  CreateQuizAnswerRequest,
  QuizAttemptQuery,
  SubmitQuizAttemptRequest,
  UpdateQuizAnswerRequest,
} from './dto/requests.dto';
import { PaginationOnly } from 'src/base/query/baseQuery';
import { QuizAttemptDrizzleRepository } from './quiz-attempt.repository';
import { QuizService } from 'src/quiz/quiz.service';

// Allowance for network latency when the last answer arrives right at the time limit
const ANSWER_GRACE_SECONDS = 10;

@Injectable()
export class QuizAttemptService {
  constructor(
    private readonly repository: QuizAttemptDrizzleRepository,
    private readonly quizService: QuizService,
  ) {}

  async create(
    createQuizAttemptDto: CreateQuizAttemptDto & { userId: number },
  ) {
    const quiz = await this.quizService.findOne(createQuizAttemptDto.quizId);

    if (!quiz) {
      throw new NotFoundException(
        `Quiz with ID ${createQuizAttemptDto.quizId} not found`,
      );
    }

    const now = Date.now();

    if (new Date(quiz.startDate).getTime() > now) {
      throw new ForbiddenException('This quiz has not started yet');
    }

    if (quiz.endDate && new Date(quiz.endDate).getTime() < now) {
      throw new ForbiddenException('This quiz has ended');
    }

    if (!quiz.isAnonymousAllowed && !createQuizAttemptDto.userId) {
      throw new ForbiddenException(
        'This quiz does not allow anonymous attempts',
      );
    }

    const existingAttempt = await this.repository.getQuizAttemptForUser(
      createQuizAttemptDto.userId,
      createQuizAttemptDto.quizId,
    );

    if (existingAttempt) {
      return existingAttempt;
    }

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
    if (query?.responseType === QuizAttemptResponsesEnum.WITH_ANSWERS) {
      throw new BadRequestException(
        'Cannot fetch attempts with answers, use getMyAttempts instead',
      );
    }

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
      IQuizAttemptResponse | IQuizAttemptWithAnswersResponse,
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

  async checkIfAnswerExists(attemptId: number, quizQuestionId: number) {
    const answer = await this.repository.getAnswer(attemptId, quizQuestionId);

    if (answer.length) {
      throw new BadRequestException('Answer already exists');
    }
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

  // An unfinished attempt can always be resumed; only a submitted one counts as taken
  async checkForPreviousAttempt(quizId: number, userId: number) {
    const hasSubmitted = await this.repository.hasSubmittedAttempt(
      userId,
      quizId,
    );

    if (hasSubmitted) {
      throw new ForbiddenException('You have already attempted this quiz');
    }
  }

  // Answers are accepted until the quiz ends and, for timed quizzes, until the attempt's time runs out
  async checkAttemptIsOpen(attemptId: number) {
    const timing = await this.repository.getAttemptTiming(attemptId);

    if (!timing) {
      throw new NotFoundException(
        `Quiz attempt with ID ${attemptId} not found`,
      );
    }

    const now = Date.now();

    if (timing.quizEndDate && new Date(timing.quizEndDate).getTime() < now) {
      throw new ForbiddenException('This quiz has ended');
    }

    if (timing.timeLimitTotal) {
      const deadline =
        new Date(timing.startedAt).getTime() +
        (timing.timeLimitTotal + ANSWER_GRACE_SECONDS) * 1000;

      if (deadline < now) {
        throw new ForbiddenException('The time for this attempt is up');
      }
    }
  }

  async checkIfTheAnswerIsFinal(answerId: number) {
    const isFinal = await this.repository.checkIfAnswerIsFinal(answerId);

    return isFinal;
  }

  async checkIfQuizIsRetakeable(quizId: number) {
    const quiz = await this.quizService.findOne(quizId);

    return quiz.isRetakeable;
  }

  async getQuizLeaderboard(quizId: number, pagination?: PaginationOnly) {
    const quiz = await this.quizService.findOne(quizId);
    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${quizId} not found`);
    }

    const leaderboard = await this.repository.getQuizLeaderboard(
      quizId,
      pagination,
    );

    return leaderboard;
  }
}
