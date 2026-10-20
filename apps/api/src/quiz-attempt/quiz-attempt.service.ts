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
import {
  ANSWER_GRACE_SECONDS,
  questionOrderFor,
  resolveQuestionPosition,
} from './questionTiming';

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

    const [questions, settings] = await Promise.all([
      this.repository.getOrderedQuestions(createQuizAttemptDto.quizId, null),
      this.repository.getQuizSettings(createQuizAttemptDto.quizId),
    ]);

    const attempt = await this.repository.createQuizAttempt(
      createQuizAttemptDto.userId,
      createQuizAttemptDto.quizId,
      questionOrderFor(
        questions.map((question) => question.id),
        !!settings?.isRandomizedQuestions,
      ),
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
    const progress = await this.getQuestionProgress(attemptId);

    const answer = await this.repository.createAnswer(
      userId,
      attemptId,
      createAnswerDto,
      { isFinal: progress.isOneAtATime },
    );

    if (!answer) {
      throw new UnprocessableEntityException('Answer creation failed');
    }

    // The next question is shown as soon as this one is answered
    if (progress.isOneAtATime) {
      await this.repository.setQuestionPosition(
        attemptId,
        progress.position.index + 1,
        new Date(),
      );
    }

    return answer;
  }

  // Where an attempt stands. Quizzes that are not tests show one question at a time, in the
  // attempt's order, each within its own time limit.
  async getQuestionProgress(attemptId: number) {
    const timing = await this.repository.getAttemptTiming(attemptId);

    if (!timing) {
      throw new NotFoundException(
        `Quiz attempt with ID ${attemptId} not found`,
      );
    }

    const questions = await this.repository.getOrderedQuestions(
      timing.quizId,
      timing.questionOrder,
    );

    const index = timing.currentQuestion ?? 0;
    const position = resolveQuestionPosition(
      questions,
      index,
      new Date(timing.questionStartedAt ?? timing.startedAt),
      Date.now(),
    );

    // Questions skipped because their time ran out are recorded, so they stay skipped
    if (!timing.isTest && position.index !== index) {
      await this.repository.setQuestionPosition(
        attemptId,
        position.index,
        position.startedAt,
      );
    }

    return { isOneAtATime: !timing.isTest, questions, position };
  }

  async getCurrentQuestion(attemptId: number) {
    const { isOneAtATime, questions, position } =
      await this.getQuestionProgress(attemptId);

    if (!isOneAtATime) {
      throw new BadRequestException(
        'This quiz is a test: all of its questions are shown at once',
      );
    }

    const current = questions[position.index];

    return {
      index: position.index,
      total: questions.length,
      startedAt: current ? position.startedAt : null,
      deadline: position.deadline,
      question: current
        ? await this.repository.getQuestionForTaker(current.id)
        : null,
    };
  }

  // In a quiz shown one question at a time only the current question can be answered, and only once
  async checkQuestionIsCurrent(attemptId: number, questionId: number) {
    const { isOneAtATime, questions, position } =
      await this.getQuestionProgress(attemptId);

    if (!isOneAtATime) {
      return;
    }

    const asked = questions.findIndex((question) => question.id === questionId);

    if (asked === -1) {
      throw new NotFoundException(
        `Quiz question with ID ${questionId} not found in this quiz`,
      );
    }

    if (asked < position.index) {
      throw new ForbiddenException(
        'This question is closed: it was answered or its time ran out',
      );
    }

    if (asked > position.index) {
      throw new ForbiddenException('Only the current question can be answered');
    }
  }

  async checkAnswersCanChange(attemptId: number) {
    const timing = await this.repository.getAttemptTiming(attemptId);

    if (timing && !timing.isTest) {
      throw new ForbiddenException(
        'Answers cannot be changed in a quiz shown one question at a time',
      );
    }
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
