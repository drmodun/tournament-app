import { Test, TestingModule } from '@nestjs/testing';
import {
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { CanEditQuizGuard } from '../guards/can-edit-quiz.guard';
import { QuizService } from '../quiz.service';

describe('CanEditQuizGuard', () => {
  let guard: CanEditQuizGuard;
  let quizService: QuizService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CanEditQuizGuard,
        {
          provide: QuizService,
          useValue: {
            checkAuthor: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<CanEditQuizGuard>(CanEditQuizGuard);
    quizService = module.get<QuizService>(QuizService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true if user is the author of the quiz', async () => {
      // Arrange
      const mockExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            user: { id: 1 },
            params: { quizId: '1' },
          }),
        }),
      } as unknown as ExecutionContext;

      jest.spyOn(quizService, 'checkAuthor').mockResolvedValue(undefined);

      // Act
      const result = await guard.canActivate(mockExecutionContext);

      // Assert
      expect(result).toBe(true);
      expect(quizService.checkAuthor).toHaveBeenCalledWith(1, 1);
    });

    it('should throw ForbiddenException if user is not authenticated', async () => {
      // Arrange
      const mockExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            user: null,
            params: { quizId: '1' },
          }),
        }),
      } as unknown as ExecutionContext;

      // Act & Assert
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        ForbiddenException,
      );
      expect(quizService.checkAuthor).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if quizId is invalid', async () => {
      // Arrange
      const mockExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            user: { id: 1 },
            params: { quizId: 'invalid' },
          }),
        }),
      } as unknown as ExecutionContext;

      // Act & Assert
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        NotFoundException,
      );
      expect(quizService.checkAuthor).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user is not the author', async () => {
      // Arrange
      const mockExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            user: { id: 1 },
            params: { quizId: '2' },
          }),
        }),
      } as unknown as ExecutionContext;

      jest
        .spyOn(quizService, 'checkAuthor')
        .mockRejectedValue(
          new ForbiddenException('You are not the author of this quiz'),
        );

      // Act & Assert
      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        ForbiddenException,
      );
      expect(quizService.checkAuthor).toHaveBeenCalledWith(2, 1);
    });
  });
});
