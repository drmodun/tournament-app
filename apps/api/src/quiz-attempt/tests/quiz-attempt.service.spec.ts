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

      const result = await service.create(createDto);

      expect(result).toEqual(mockAttempt);
      expect(quizService.findOne).toHaveBeenCalledWith(quizId);
      expect(repository.getQuizAttemptForUser).toHaveBeenCalledWith(
        userId,
        quizId,
      );
      expect(repository.createQuizAttempt).toHaveBeenCalledWith(userId, quizId);
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

    it('should throw UnprocessableEntityException if attempt creation fails', async () => {
      mockQuizService.findOne.mockResolvedValue(mockQuiz);
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

    it('should create answer successfully', async () => {
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
      );
    });

    it('should throw UnprocessableEntityException if answer creation fails', async () => {
      mockRepository.createAnswer.mockResolvedValue(null);

      await expect(
        service.createAnswer(attemptId, userId, createAnswerDto),
      ).rejects.toThrow(UnprocessableEntityException);
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
});
