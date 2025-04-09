import { Test, TestingModule } from '@nestjs/testing';
import { QuizService } from '../quiz.service';
import { QuizDrizzleRepository } from '../quiz.repository';
import {
  NotFoundException,
  UnprocessableEntityException,
  ForbiddenException,
} from '@nestjs/common';
import { QuizResponsesEnum } from '@tournament-app/types';

describe('QuizService', () => {
  let service: QuizService;
  let repository: QuizDrizzleRepository;

  const mockRepository = {
    create: jest.fn(),
    getQuery: jest.fn(),
    getSingleQuery: jest.fn(),
    update: jest.fn(),
    deleteEntity: jest.fn(),
    getAutoComplete: jest.fn(),
    getAuthoredQuizzes: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuizService,
        {
          provide: QuizDrizzleRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<QuizService>(QuizService);
    repository = module.get<QuizDrizzleRepository>(QuizDrizzleRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a quiz successfully', async () => {
      // Arrange
      const createQuizDto = {
        name: 'Test Quiz',
        authorId: 1,
        startDate: new Date(),
        questions: [],
        tags: [],
      };
      mockRepository.create.mockResolvedValue([{ id: 1, ...createQuizDto }]);

      // Act
      const result = await service.create(createQuizDto);

      // Assert
      expect(result).toEqual([{ id: 1, ...createQuizDto }]);
      expect(mockRepository.create).toHaveBeenCalledWith(createQuizDto);
    });

    it('should throw UnprocessableEntityException if creation fails', async () => {
      // Arrange
      const createQuizDto = {
        name: 'Test Quiz',
        authorId: 1,
        startDate: new Date(),
        questions: [],
        tags: [],
      };
      mockRepository.create.mockResolvedValue([]);

      // Act & Assert
      await expect(service.create(createQuizDto)).rejects.toThrow(
        UnprocessableEntityException,
      );
      expect(mockRepository.create).toHaveBeenCalledWith(createQuizDto);
    });
  });

  describe('findAll', () => {
    it('should return all quizzes', async () => {
      // Arrange
      const query = { page: 1, pageSize: 10 };
      const expectedQuizzes = [
        { id: 1, name: 'Quiz 1' },
        { id: 2, name: 'Quiz 2' },
      ];
      mockRepository.getQuery.mockReturnValue(Promise.resolve(expectedQuizzes));

      // Act
      const result = await service.findAll(query);

      // Assert
      expect(result).toEqual(expectedQuizzes);
      expect(mockRepository.getQuery).toHaveBeenCalledWith({
        ...query,
        responseType: QuizResponsesEnum.BASE,
      });
    });
  });

  describe('findOne', () => {
    it('should return a quiz by id', async () => {
      // Arrange
      const id = 1;
      const expectedQuiz = { id, name: 'Quiz 1' };
      mockRepository.getSingleQuery.mockResolvedValue([expectedQuiz]);

      // Act
      const result = await service.findOne(id);

      // Assert
      expect(result).toEqual(expectedQuiz);
      expect(mockRepository.getSingleQuery).toHaveBeenCalledWith(
        id,
        QuizResponsesEnum.BASE,
      );
    });

    it('should throw NotFoundException if quiz not found', async () => {
      // Arrange
      const id = 999;
      mockRepository.getSingleQuery.mockResolvedValue([]);

      // Act & Assert
      await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
      expect(mockRepository.getSingleQuery).toHaveBeenCalledWith(
        id,
        QuizResponsesEnum.BASE,
      );
    });
  });

  describe('update', () => {
    it('should update a quiz successfully', async () => {
      // Arrange
      const id = 1;
      const updateQuizDto = { name: 'Updated Quiz' };
      mockRepository.update.mockResolvedValue([{ id, ...updateQuizDto }]);

      // Act
      const result = await service.update(id, updateQuizDto);

      // Assert
      expect(result).toEqual([{ id, ...updateQuizDto }]);
      expect(mockRepository.update).toHaveBeenCalledWith(id, updateQuizDto);
    });

    it('should throw NotFoundException if quiz not found', async () => {
      // Arrange
      const id = 999;
      const updateQuizDto = { name: 'Updated Quiz' };
      mockRepository.update.mockResolvedValue([]);

      // Act & Assert
      await expect(service.update(id, updateQuizDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRepository.update).toHaveBeenCalledWith(id, updateQuizDto);
    });
  });

  describe('remove', () => {
    it('should remove a quiz successfully', async () => {
      // Arrange
      const id = 1;
      mockRepository.deleteEntity.mockResolvedValue([{ id }]);

      // Act
      const result = await service.remove(id);

      // Assert
      expect(result).toEqual({ id });
      expect(mockRepository.deleteEntity).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException if quiz not found', async () => {
      // Arrange
      const id = 999;
      mockRepository.deleteEntity.mockResolvedValue([]);

      // Act & Assert
      await expect(service.remove(id)).rejects.toThrow(NotFoundException);
      expect(mockRepository.deleteEntity).toHaveBeenCalledWith(id);
    });
  });

  describe('autoComplete', () => {
    it('should return quizzes matching the search term', async () => {
      // Arrange
      const search = 'test';
      const query = { pageSize: 10, page: 1 };
      const expectedQuizzes = [{ id: 1, name: 'Test Quiz' }];
      mockRepository.getAutoComplete.mockResolvedValue(expectedQuizzes);

      // Act
      const result = await service.autoComplete(search, query);

      // Assert
      expect(result).toEqual(expectedQuizzes);
      expect(mockRepository.getAutoComplete).toHaveBeenCalledWith(
        search,
        query.pageSize,
        query.page,
      );
    });
  });

  describe('getAuthoredQuizzes', () => {
    it('should return quizzes authored by the user', async () => {
      // Arrange
      const userId = 1;
      const pagination = { pageSize: 10, page: 1 };
      const expectedQuizzes = [{ id: 1, name: 'Quiz 1', authorId: userId }];
      mockRepository.getAuthoredQuizzes.mockResolvedValue(expectedQuizzes);

      // Act
      const result = await service.getAuthoredQuizzes(userId, pagination);

      // Assert
      expect(result).toEqual(expectedQuizzes);
      expect(mockRepository.getAuthoredQuizzes).toHaveBeenCalledWith(
        userId,
        pagination,
      );
    });
  });

  describe('checkAuthor', () => {
    it('should not throw an error if user is the author', async () => {
      // Arrange
      const quizId = 1;
      const userId = 1;
      mockRepository.getSingleQuery.mockResolvedValue([
        { id: quizId, authorId: userId },
      ]);

      // Act & Assert
      await expect(service.checkAuthor(quizId, userId)).resolves.not.toThrow();
      expect(mockRepository.getSingleQuery).toHaveBeenCalledWith(quizId);
    });

    it('should throw NotFoundException if quiz not found', async () => {
      // Arrange
      const quizId = 999;
      const userId = 1;
      mockRepository.getSingleQuery.mockResolvedValue([]);

      // Act & Assert
      await expect(service.checkAuthor(quizId, userId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRepository.getSingleQuery).toHaveBeenCalledWith(quizId);
    });

    it('should throw ForbiddenException if user is not the author', async () => {
      // Arrange
      const quizId = 1;
      const userId = 2;
      mockRepository.getSingleQuery.mockResolvedValue([
        { id: quizId, authorId: 1 },
      ]);

      // Act & Assert
      await expect(service.checkAuthor(quizId, userId)).rejects.toThrow(
        ForbiddenException,
      );
      expect(mockRepository.getSingleQuery).toHaveBeenCalledWith(quizId);
    });
  });
});
