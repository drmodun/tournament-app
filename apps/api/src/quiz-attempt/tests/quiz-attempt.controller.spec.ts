import { Test, TestingModule } from '@nestjs/testing';
import { QuizAttemptController } from '../quiz-attempt.controller';
import { QuizAttemptService } from '../quiz-attempt.service';
import { QuizAttemptResponsesEnum } from '@tournament-app/types';
import { MetadataMaker } from 'src/base/static/makeMetadata';

jest.mock('src/base/static/makeMetadata', () => ({
  MetadataMaker: {
    makeMetadataFromQuery: jest.fn().mockReturnValue({
      page: 1,
      pageSize: 10,
      total: 2,
    }),
  },
}));

describe('QuizAttemptController', () => {
  let controller: QuizAttemptController;
  let service: QuizAttemptService;

  const mockService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    submitAttempt: jest.fn(),
    createAnswer: jest.fn(),
    updateAnswer: jest.fn(),
    getUserAttempts: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuizAttemptController],
      providers: [
        {
          provide: QuizAttemptService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<QuizAttemptController>(QuizAttemptController);
    service = module.get<QuizAttemptService>(QuizAttemptService);

    // Reset mocks between tests
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    const query = { page: 1, pageSize: 10 };
    const mockResults = [{ id: 1 }, { id: 2 }];
    const mockUser = { id: 1, role: 'user' };
    const mockRequest = { url: '/quiz-attempt' };

    it('should return results with metadata for regular users', async () => {
      mockService.findAll.mockResolvedValue(mockResults);

      const result = await controller.findAll(
        query,
        mockRequest as any,
        mockUser as any,
      );

      expect(result).toEqual({
        results: mockResults,
        metadata: {
          page: 1,
          pageSize: 10,
          total: 2,
        },
      });
      expect(service.findAll).toHaveBeenCalledWith({
        ...query,
        userId: mockUser.id,
      });
      expect(MetadataMaker.makeMetadataFromQuery).toHaveBeenCalledWith(
        { ...query, userId: mockUser.id },
        mockResults,
        mockRequest.url,
      );
    });

    it('should not filter by userId for admin users', async () => {
      const adminUser = { id: 1, role: 'admin' };
      mockService.findAll.mockResolvedValue(mockResults);

      await controller.findAll(query, mockRequest as any, adminUser as any);

      expect(service.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('getMyAttempts', () => {
    const pagination = { page: 1, pageSize: 10 };
    const mockUser = { id: 1 };
    const mockAttempts = [{ id: 1 }, { id: 2 }];

    it('should return attempts for current user', async () => {
      mockService.getUserAttempts.mockResolvedValue(mockAttempts);

      const result = await controller.getMyAttempts(
        mockUser as any,
        pagination,
      );

      expect(result).toEqual(mockAttempts);
      expect(service.getUserAttempts).toHaveBeenCalledWith(
        mockUser.id,
        pagination,
      );
    });
  });

  describe('findOne', () => {
    const attemptId = 1;
    const responseType = QuizAttemptResponsesEnum.BASE;
    const mockAttempt = { id: attemptId };

    it('should return attempt by id', async () => {
      mockService.findOne.mockResolvedValue(mockAttempt);

      const result = await controller.findOne(attemptId, responseType);

      expect(result).toEqual(mockAttempt);
      expect(service.findOne).toHaveBeenCalledWith(attemptId, responseType);
    });
  });

  describe('create', () => {
    const createDto = { quizId: { id: 1 } };
    const mockUser = { id: 1 };
    const mockAttempt = { id: 1 };

    it('should create a new attempt', async () => {
      mockService.create.mockResolvedValue(mockAttempt);

      const result = await controller.create(
        createDto as any,
        mockUser as any,
        mockUser as any,
      );

      expect(result).toEqual(mockAttempt);
      expect(service.create).toHaveBeenCalledWith({
        ...createDto,
        userId: mockUser.id,
      });
    });
  });

  describe('submitAttempt', () => {
    const attemptId = 1;
    const submitDto = { isSubmitted: true };
    const mockUpdatedAttempt = { id: attemptId };

    it('should submit attempt', async () => {
      mockService.submitAttempt.mockResolvedValue(mockUpdatedAttempt);

      const result = await controller.submitAttempt(attemptId, submitDto);

      expect(result).toEqual(mockUpdatedAttempt);
      expect(service.submitAttempt).toHaveBeenCalledWith(attemptId, submitDto);
    });
  });

  describe('createAnswer', () => {
    const attemptId = 1;
    const questionId = 1;
    const createAnswerDto = {
      quizQuestionId: 1,
      attemptId: 1,
      answer: 'Test answer',
    };
    const mockUser = { id: 1 };
    const mockAnswer = { id: 1 };

    it('should create a new answer', async () => {
      mockService.createAnswer.mockResolvedValue(mockAnswer);

      const result = await controller.createAnswer(
        attemptId,
        questionId,
        createAnswerDto,
        mockUser as any,
      );

      expect(result).toEqual(mockAnswer);
      expect(service.createAnswer).toHaveBeenCalledWith(
        attemptId,
        mockUser.id,
        createAnswerDto,
      );
    });
  });

  describe('updateAnswer', () => {
    const answerId = 1;
    const updateAnswerDto = { answer: 'Updated answer' };
    const mockUser = { id: 1 };
    const mockUpdatedAnswer = { id: answerId };

    it('should update an answer', async () => {
      mockService.updateAnswer.mockResolvedValue(mockUpdatedAnswer);

      const result = await controller.updateAnswer(
        answerId,
        updateAnswerDto,
        mockUser as any,
      );

      expect(result).toEqual(mockUpdatedAnswer);
      expect(service.updateAnswer).toHaveBeenCalledWith(
        answerId,
        mockUser.id,
        updateAnswerDto,
      );
    });
  });
});
