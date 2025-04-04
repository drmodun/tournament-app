import { Test, TestingModule } from '@nestjs/testing';
import { QuizController } from '../quiz.controller';
import { QuizService } from '../quiz.service';
import {
  CreateQuizRequest,
  UpdateQuizRequest,
  QuizQuery,
} from '../dto/requests.dto';
import { QuizResponsesEnum } from '@tournament-app/types';
import { MetadataMaker } from 'src/base/static/makeMetadata';
import { Request } from 'express';

// Mock the MetadataMaker
jest.mock('src/base/static/makeMetadata', () => ({
  MetadataMaker: {
    makeMetadataFromQuery: jest.fn().mockReturnValue({
      page: 1,
      pageSize: 10,
      totalCount: 2,
      totalPages: 1,
    }),
  },
}));

describe('QuizController', () => {
  let controller: QuizController;
  let service: QuizService;

  const mockQuizService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    autoComplete: jest.fn(),
    getAuthoredQuizzes: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuizController],
      providers: [
        {
          provide: QuizService,
          useValue: mockQuizService,
        },
      ],
    }).compile();

    controller = module.get<QuizController>(QuizController);
    service = module.get<QuizService>(QuizService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all quizzes with metadata', async () => {
      // Arrange
      const query: QuizQuery = { page: 1, pageSize: 10 };
      const quizzes = [
        { id: 1, name: 'Quiz 1' },
        { id: 2, name: 'Quiz 2' },
      ];
      mockQuizService.findAll.mockResolvedValue(quizzes);
      const req = { url: '/quizzes' } as Request;

      // Act
      const result = await controller.findAll(query, req as any);

      // Assert
      expect(result).toEqual({
        results: quizzes,
        metadata: {
          page: 1,
          pageSize: 10,
          totalCount: 2,
          totalPages: 1,
        },
      });
      expect(mockQuizService.findAll).toHaveBeenCalledWith(query);
      expect(MetadataMaker.makeMetadataFromQuery).toHaveBeenCalledWith(
        query,
        quizzes,
        req.url,
      );
    });
  });

  describe('findOne', () => {
    it('should return a quiz by id', async () => {
      // Arrange
      const id = 1;
      const responseType = QuizResponsesEnum.BASE;
      const quiz = { id, name: 'Quiz 1' };
      mockQuizService.findOne.mockResolvedValue(quiz);

      // Act
      const result = await controller.findOne(id, responseType as any);

      // Assert
      expect(result).toEqual(quiz);
      expect(mockQuizService.findOne).toHaveBeenCalledWith(id, responseType);
    });
  });

  describe('create', () => {
    it('should create a new quiz', async () => {
      // Arrange
      const user = { id: 1, username: 'testuser' };
      const createQuizDto: CreateQuizRequest = {
        name: 'New Quiz',
        startDate: new Date(),
        questions: [],
        tags: [],
      };
      const createdQuiz = { id: 1, ...createQuizDto, authorId: user.id };
      mockQuizService.create.mockResolvedValue(createdQuiz);

      // Act
      const result = await controller.create(createQuizDto, user as any);

      // Assert
      expect(result).toEqual(createdQuiz);
      expect(mockQuizService.create).toHaveBeenCalledWith({
        ...createQuizDto,
        authorId: user.id,
      });
    });
  });

  describe('update', () => {
    it('should update a quiz', async () => {
      // Arrange
      const id = 1;
      const updateQuizDto: UpdateQuizRequest = { name: 'Updated Quiz' };
      const updatedQuiz = { id, ...updateQuizDto };
      mockQuizService.update.mockResolvedValue(updatedQuiz);

      // Act
      const result = await controller.update(id, updateQuizDto);

      // Assert
      expect(result).toEqual(updatedQuiz);
      expect(mockQuizService.update).toHaveBeenCalledWith(id, updateQuizDto);
    });
  });

  describe('remove', () => {
    it('should remove a quiz', async () => {
      // Arrange
      const id = 1;
      const deletedQuiz = { id };
      mockQuizService.remove.mockResolvedValue(deletedQuiz);

      // Act
      const result = await controller.remove(id);

      // Assert
      expect(result).toEqual(deletedQuiz);
      expect(mockQuizService.remove).toHaveBeenCalledWith(id);
    });
  });

  describe('autoComplete', () => {
    it('should return quizzes matching the search term', async () => {
      // Arrange
      const search = 'test';
      const query = { pageSize: 10, page: 1 };
      const quizzes = [{ id: 1, name: 'Test Quiz' }];
      mockQuizService.autoComplete.mockResolvedValue(quizzes);

      // Act
      const result = await controller.autoComplete(search, query);

      // Assert
      expect(result).toEqual(quizzes);
      expect(mockQuizService.autoComplete).toHaveBeenCalledWith(search, query);
    });
  });

  describe('getAuthoredQuizzes', () => {
    it('should return quizzes authored by the user', async () => {
      // Arrange
      const user = { id: 1, username: 'testuser' };
      const query = { pageSize: 10, page: 1 };
      const quizzes = [{ id: 1, name: 'Quiz 1', authorId: user.id }];
      mockQuizService.getAuthoredQuizzes.mockResolvedValue(quizzes);

      // Act
      const result = await controller.getAuthoredQuizzes(user as any, query);

      // Assert
      expect(result).toEqual(quizzes);
      expect(mockQuizService.getAuthoredQuizzes).toHaveBeenCalledWith(
        user.id,
        query,
      );
    });
  });
});
