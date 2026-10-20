import { Test, TestingModule } from '@nestjs/testing';
import {
  ForbiddenException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { QuizAttemptService } from '../quiz-attempt.service';
import { QuizAttemptDrizzleRepository } from '../quiz-attempt.repository';
import { QuizService } from '../../quiz/quiz.service';
import { QuizAttemptResponsesEnum } from '@tournament-app/types';

describe('QuizAttemptService', () => {
  let service: QuizAttemptService;
  let repository: QuizAttemptDrizzleRepository;
  let quizService: QuizService;

  const mockRepository = {
    getQuery: jest.fn(),
    getSingleQuery: jest.fn(),
    createQuizAttempt: jest.fn(),
    submitQuizAttempt: jest.fn(),
    createAnswer: jest.fn(),
    updateAnswer: jest.fn(),
    getQuizAttemptForUser: jest.fn(),
    getUserAttempts: jest.fn(),
    hasSubmittedAttempt: jest.fn(),
    getAttemptTiming: jest.fn(),
    getOrderedQuestions: jest.fn(),
    getQuizSettings: jest.fn(),
    setQuestionPosition: jest.fn(),
    getQuestionForTaker: jest.fn(),
  };

  const mockQuizService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuizAttemptService,
        {
          provide: QuizAttemptDrizzleRepository,
          useValue: mockRepository,
        },
        {
          provide: QuizService,
          useValue: mockQuizService,
        },
      ],
    }).compile();

    service = module.get<QuizAttemptService>(QuizAttemptService);
    repository = module.get<QuizAttemptDrizzleRepository>(
      QuizAttemptDrizzleRepository,
    );
    quizService = module.get<QuizService>(QuizService);

    // Reset mocks between tests
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const userId = 1;
    const quizId = 1;
    const createDto = { quizId, userId };
    const mockQuiz = { id: quizId, isAnonymousAllowed: true };
    const mockAttempt = { id: 1 };

    it('should create a new quiz attempt successfully', async () => {
      mockQuizService.findOne.mockResolvedValue(mockQuiz);
      mockRepository.getQuizAttemptForUser.mockResolvedValue(null);
      mockRepository.createQuizAttempt.mockResolvedValue(mockAttempt);
      mockRepository.getOrderedQuestions.mockResolvedValue([
        { id: 4, timeLimit: null },
        { id: 2, timeLimit: 30 },
      ]);
      mockRepository.getQuizSettings.mockResolvedValue({
        isRandomizedQuestions: false,
      });

      const result = await service.create(createDto);

      expect(result).toEqual(mockAttempt);
      expect(quizService.findOne).toHaveBeenCalledWith(quizId);
      expect(repository.getQuizAttemptForUser).toHaveBeenCalledWith(
        userId,
        quizId,
      );
      expect(repository.createQuizAttempt).toHaveBeenCalledWith(
        userId,
        quizId,
        [2, 4],
      );
    });

    it('should return existing attempt if one exists', async () => {
      const existingAttempt = { id: 2 };
      mockQuizService.findOne.mockResolvedValue(mockQuiz);
      mockRepository.getQuizAttemptForUser.mockResolvedValue(existingAttempt);

      const result = await service.create(createDto);

      expect(result).toEqual(existingAttempt);
      expect(repository.createQuizAttempt).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if quiz not found', async () => {
      mockQuizService.findOne.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.getQuizAttemptForUser).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException if quiz does not allow anonymous and user is anonymous', async () => {
      mockQuizService.findOne.mockResolvedValue({
        id: quizId,
        isAnonymousAllowed: false,
      });

      await expect(service.create({ quizId, userId: null })).rejects.toThrow(
        ForbiddenException,
      );
      expect(repository.getQuizAttemptForUser).not.toHaveBeenCalled();
    });

    it('should refuse to start a quiz before its start date', async () => {
      mockQuizService.findOne.mockResolvedValue({
        ...mockQuiz,
        startDate: new Date(Date.now() + 60_000),
      });

      await expect(service.create(createDto)).rejects.toThrow(
        'This quiz has not started yet',
      );
      expect(repository.createQuizAttempt).not.toHaveBeenCalled();
    });

    it('should refuse to start a quiz after its end date', async () => {
      mockQuizService.findOne.mockResolvedValue({
        ...mockQuiz,
        startDate: new Date(Date.now() - 120_000),
        endDate: new Date(Date.now() - 60_000),
      });

      await expect(service.create(createDto)).rejects.toThrow(
        'This quiz has ended',
      );
      expect(repository.createQuizAttempt).not.toHaveBeenCalled();
    });

    it('should throw UnprocessableEntityException if attempt creation fails', async () => {
      mockQuizService.findOne.mockResolvedValue(mockQuiz);
      mockRepository.getOrderedQuestions.mockResolvedValue([]);
      mockRepository.getQuizSettings.mockResolvedValue({});
      mockRepository.getQuizAttemptForUser.mockResolvedValue(null);
      mockRepository.createQuizAttempt.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });
  });

  describe('findAll', () => {
    const query = { responseType: QuizAttemptResponsesEnum.BASE };
    const mockResults = [{ id: 1 }, { id: 2 }];

    it('should return results from repository', async () => {
      mockRepository.getQuery.mockResolvedValue(mockResults);

      const result = await service.findAll(query);

      expect(result).toEqual(mockResults);
      expect(repository.getQuery).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    const attemptId = 1;
    const responseType = QuizAttemptResponsesEnum.BASE;
    const mockAttempt = { id: attemptId };

    it('should return attempt by id', async () => {
      mockRepository.getSingleQuery.mockResolvedValue([mockAttempt]);

      const result = await service.findOne(attemptId, responseType);

      expect(result).toEqual(mockAttempt);
      expect(repository.getSingleQuery).toHaveBeenCalledWith(
        attemptId,
        responseType,
      );
    });

    it('should throw NotFoundException if attempt not found', async () => {
      mockRepository.getSingleQuery.mockResolvedValue([]);

      await expect(service.findOne(attemptId, responseType)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('submitAttempt', () => {
    const attemptId = 1;
    const submitDto = { isSubmitted: true };
    const mockUpdatedAttempt = { id: attemptId };

    it('should submit attempt successfully', async () => {
      mockRepository.submitQuizAttempt.mockResolvedValue(mockUpdatedAttempt);

      const result = await service.submitAttempt(attemptId, submitDto);

      expect(result).toEqual(mockUpdatedAttempt);
      expect(repository.submitQuizAttempt).toHaveBeenCalledWith(
        attemptId,
        submitDto.isSubmitted,
      );
    });

    it('should throw NotFoundException if attempt submission fails', async () => {
      mockRepository.submitQuizAttempt.mockResolvedValue(null);

      await expect(service.submitAttempt(attemptId, submitDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createAnswer', () => {
    const attemptId = 1;
    const userId = 1;
    const createAnswerDto = { quizQuestionId: 1, answer: 'Test answer' };
    const mockAnswer = { id: 1 };
    const timing = (isTest: boolean) => ({
      quizId: 3,
      isTest,
      currentQuestion: 0,
      questionOrder: [1, 2],
      startedAt: new Date(),
      questionStartedAt: new Date(),
    });

    beforeEach(() => {
      mockRepository.getOrderedQuestions.mockResolvedValue([
        { id: 1, timeLimit: 60 },
        { id: 2, timeLimit: null },
      ]);
    });

    it('should create answer successfully in a test', async () => {
      mockRepository.getAttemptTiming.mockResolvedValue(timing(true));
      mockRepository.createAnswer.mockResolvedValue(mockAnswer);

      const result = await service.createAnswer(
        attemptId,
        userId,
        createAnswerDto,
      );

      expect(result).toEqual(mockAnswer);
      expect(repository.createAnswer).toHaveBeenCalledWith(
        userId,
        attemptId,
        createAnswerDto,
        { isFinal: false },
      );
      expect(repository.setQuestionPosition).not.toHaveBeenCalled();
    });

    it('makes the answer final and shows the next question in a quiz shown one at a time', async () => {
      mockRepository.getAttemptTiming.mockResolvedValue(timing(false));
      mockRepository.createAnswer.mockResolvedValue(mockAnswer);

      await service.createAnswer(attemptId, userId, createAnswerDto);

      expect(repository.createAnswer).toHaveBeenCalledWith(
        userId,
        attemptId,
        createAnswerDto,
        { isFinal: true },
      );
      expect(repository.setQuestionPosition).toHaveBeenCalledWith(
        attemptId,
        1,
        expect.any(Date),
      );
    });

    it('should throw UnprocessableEntityException if answer creation fails', async () => {
      mockRepository.getAttemptTiming.mockResolvedValue(timing(true));
      mockRepository.createAnswer.mockResolvedValue(null);

      await expect(
        service.createAnswer(attemptId, userId, createAnswerDto),
      ).rejects.toThrow(UnprocessableEntityException);
    });
  });

  describe('one question at a time', () => {
    const questions = [
      { id: 7, timeLimit: 30 },
      { id: 5, timeLimit: null },
    ];
    const attemptAt = (secondsAgo: number, isTest = false) => ({
      quizId: 3,
      isTest,
      currentQuestion: 0,
      questionOrder: [7, 5],
      startedAt: new Date(Date.now() - secondsAgo * 1000),
      questionStartedAt: new Date(Date.now() - secondsAgo * 1000),
    });

    beforeEach(() => {
      mockRepository.getOrderedQuestions.mockResolvedValue(questions);
    });

    it('returns the current question without its answers, with its deadline', async () => {
      mockRepository.getAttemptTiming.mockResolvedValue(attemptAt(5));
      mockRepository.getQuestionForTaker.mockResolvedValue({
        id: 7,
        question: 'Q',
        options: [{ id: 1, option: 'A' }],
      });

      const result = await service.getCurrentQuestion(1);

      expect(result).toMatchObject({ index: 0, total: 2 });
      expect(result.deadline).toBeInstanceOf(Date);
      expect(result.question).toEqual({
        id: 7,
        question: 'Q',
        options: [{ id: 1, option: 'A' }],
      });
      expect(repository.getQuestionForTaker).toHaveBeenCalledWith(7);
      expect(repository.setQuestionPosition).not.toHaveBeenCalled();
    });

    it('moves past a question whose time ran out and records it', async () => {
      mockRepository.getAttemptTiming.mockResolvedValue(attemptAt(60));
      mockRepository.getQuestionForTaker.mockResolvedValue({ id: 5 });

      const result = await service.getCurrentQuestion(1);

      expect(result.index).toBe(1);
      expect(result.deadline).toBeNull();
      expect(repository.setQuestionPosition).toHaveBeenCalledWith(
        1,
        1,
        expect.any(Date),
      );
    });

    it('returns no question once every question is done', async () => {
      mockRepository.getAttemptTiming.mockResolvedValue({
        ...attemptAt(5),
        currentQuestion: 2,
      });

      const result = await service.getCurrentQuestion(1);

      expect(result).toMatchObject({ index: 2, total: 2, question: null });
    });

    it('refuses for a test, which shows every question', async () => {
      mockRepository.getAttemptTiming.mockResolvedValue(attemptAt(5, true));

      await expect(service.getCurrentQuestion(1)).rejects.toThrow(
        'all of its questions are shown at once',
      );
    });

    it('accepts an answer to the current question only', async () => {
      mockRepository.getAttemptTiming.mockResolvedValue(attemptAt(5));

      await expect(
        service.checkQuestionIsCurrent(1, 7),
      ).resolves.toBeUndefined();
      await expect(service.checkQuestionIsCurrent(1, 5)).rejects.toThrow(
        'Only the current question can be answered',
      );
      await expect(service.checkQuestionIsCurrent(1, 99)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('refuses an answer after the question time ran out', async () => {
      mockRepository.getAttemptTiming.mockResolvedValue(attemptAt(60));

      await expect(service.checkQuestionIsCurrent(1, 7)).rejects.toThrow(
        'This question is closed',
      );
    });

    it('accepts any question in a test', async () => {
      mockRepository.getAttemptTiming.mockResolvedValue(attemptAt(60, true));

      await expect(
        service.checkQuestionIsCurrent(1, 5),
      ).resolves.toBeUndefined();
    });

    it('refuses changed answers only outside tests', async () => {
      mockRepository.getAttemptTiming.mockResolvedValue(attemptAt(5));
      await expect(service.checkAnswersCanChange(1)).rejects.toThrow(
        ForbiddenException,
      );

      mockRepository.getAttemptTiming.mockResolvedValue(attemptAt(5, true));
      await expect(service.checkAnswersCanChange(1)).resolves.toBeUndefined();
    });
  });

  describe('updateAnswer', () => {
    const answerId = 1;
    const userId = 1;
    const updateAnswerDto = { answer: 'Updated answer' };
    const mockUpdatedAnswer = { id: answerId };

    it('should update answer successfully', async () => {
      mockRepository.updateAnswer.mockResolvedValue(mockUpdatedAnswer);

      const result = await service.updateAnswer(
        answerId,
        userId,
        updateAnswerDto,
      );

      expect(result).toEqual(mockUpdatedAnswer);
      expect(repository.updateAnswer).toHaveBeenCalledWith(
        answerId,
        userId,
        updateAnswerDto,
      );
    });

    it('should throw NotFoundException if answer update fails', async () => {
      mockRepository.updateAnswer.mockResolvedValue(null);

      await expect(
        service.updateAnswer(answerId, userId, updateAnswerDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getUserAttempts', () => {
    const userId = 1;
    const pagination = { page: 1, pageSize: 10 };
    const mockAttempts = [{ id: 1 }, { id: 2 }];

    it('should return user attempts', async () => {
      mockRepository.getUserAttempts.mockResolvedValue(mockAttempts);

      const result = await service.getUserAttempts(userId, pagination);

      expect(result).toEqual(mockAttempts);
      expect(repository.getUserAttempts).toHaveBeenCalledWith(
        userId,
        pagination,
      );
    });
  });

  describe('checkAttempter', () => {
    const attemptId = 1;
    const userId = 1;
    const mockAttempt = [{ id: attemptId, userId }];

    it('should not throw error if user is owner of attempt', async () => {
      mockRepository.getSingleQuery.mockResolvedValue(mockAttempt);

      await expect(
        service.checkAttempter(attemptId, userId),
      ).resolves.not.toThrow();
      expect(repository.getSingleQuery).toHaveBeenCalledWith(attemptId);
    });

    it('should throw NotFoundException if attempt not found', async () => {
      mockRepository.getSingleQuery.mockResolvedValue([]);

      await expect(service.checkAttempter(attemptId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user is not owner', async () => {
      mockRepository.getSingleQuery.mockResolvedValue([
        { id: attemptId, userId: 999 },
      ]);

      await expect(service.checkAttempter(attemptId, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('checkForPreviousAttempt', () => {
    it('allows a user without a submitted attempt, so an unfinished one can be resumed', async () => {
      mockRepository.hasSubmittedAttempt.mockResolvedValue(false);

      await expect(service.checkForPreviousAttempt(1, 2)).resolves.toBe(
        undefined,
      );
      expect(repository.hasSubmittedAttempt).toHaveBeenCalledWith(2, 1);
    });

    it('refuses a user who already submitted an attempt', async () => {
      mockRepository.hasSubmittedAttempt.mockResolvedValue(true);

      await expect(service.checkForPreviousAttempt(1, 2)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('checkAttemptIsOpen', () => {
    const minutesAgo = (minutes: number) =>
      new Date(Date.now() - minutes * 60_000);

    it('accepts answers for an untimed quiz without an end date', async () => {
      mockRepository.getAttemptTiming.mockResolvedValue({
        startedAt: minutesAgo(600),
        quizStartDate: minutesAgo(700),
        quizEndDate: null,
        timeLimitTotal: null,
      });

      await expect(service.checkAttemptIsOpen(1)).resolves.toBeUndefined();
    });

    it('accepts answers within the time limit', async () => {
      mockRepository.getAttemptTiming.mockResolvedValue({
        startedAt: minutesAgo(5),
        quizStartDate: minutesAgo(10),
        quizEndDate: null,
        timeLimitTotal: 600,
      });

      await expect(service.checkAttemptIsOpen(1)).resolves.toBeUndefined();
    });

    it('refuses answers once the time limit has passed', async () => {
      mockRepository.getAttemptTiming.mockResolvedValue({
        startedAt: minutesAgo(11),
        quizStartDate: minutesAgo(20),
        quizEndDate: null,
        timeLimitTotal: 600,
      });

      await expect(service.checkAttemptIsOpen(1)).rejects.toThrow(
        'The time for this attempt is up',
      );
    });

    it('refuses answers after the quiz has ended', async () => {
      mockRepository.getAttemptTiming.mockResolvedValue({
        startedAt: minutesAgo(5),
        quizStartDate: minutesAgo(20),
        quizEndDate: minutesAgo(1),
        timeLimitTotal: null,
      });

      await expect(service.checkAttemptIsOpen(1)).rejects.toThrow(
        'This quiz has ended',
      );
    });

    it('throws NotFoundException for an unknown attempt', async () => {
      mockRepository.getAttemptTiming.mockResolvedValue(undefined);

      await expect(service.checkAttemptIsOpen(1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
