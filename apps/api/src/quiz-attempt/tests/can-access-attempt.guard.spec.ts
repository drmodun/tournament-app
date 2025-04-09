import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, NotFoundException } from '@nestjs/common';
import { CanAccessAttemptGuard } from '../guards/can-access-attempt.guard';
import { QuizAttemptService } from '../quiz-attempt.service';

describe('CanAccessAttemptGuard', () => {
  let guard: CanAccessAttemptGuard;
  let quizAttemptService: jest.Mocked<QuizAttemptService>;

  beforeEach(async () => {
    const mockQuizAttemptService = {
      checkAttempter: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CanAccessAttemptGuard,
        {
          provide: QuizAttemptService,
          useValue: mockQuizAttemptService,
        },
      ],
    }).compile();

    guard = module.get<CanAccessAttemptGuard>(CanAccessAttemptGuard);
    quizAttemptService = module.get(
      QuizAttemptService,
    ) as jest.Mocked<QuizAttemptService>;
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should allow admin users without checking attempt', async () => {
      // Create a mock execution context
      const context = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            user: { id: 1, role: 'admin' },
            params: { attemptId: '1' },
          }),
        }),
      } as unknown as ExecutionContext;

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(quizAttemptService.checkAttempter).not.toHaveBeenCalled();
    });

    it('should check attempt access for non-admin users', async () => {
      // Mock the quiz attempt service to resolve successfully
      quizAttemptService.checkAttempter.mockResolvedValue(undefined);

      // Create a mock execution context
      const context = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            user: { id: 1, role: 'user' },
            params: { attemptId: '1' },
          }),
        }),
      } as unknown as ExecutionContext;

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(quizAttemptService.checkAttempter).toHaveBeenCalledWith(1, 1);
    });

    it('should throw NotFoundException when attempt ID is missing', async () => {
      // Create a mock execution context without attempt ID
      const context = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            user: { id: 1, role: 'user' },
            params: {},
          }),
        }),
      } as unknown as ExecutionContext;

      await expect(guard.canActivate(context)).rejects.toThrow(
        NotFoundException,
      );
      expect(quizAttemptService.checkAttempter).not.toHaveBeenCalled();
    });

    it('should throw error when attempt access check fails', async () => {
      // Mock the quiz attempt service to reject with error
      const mockError = new Error('Not the attempter');
      quizAttemptService.checkAttempter.mockRejectedValue(mockError);

      // Create a mock execution context
      const context = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            user: { id: 1, role: 'user' },
            params: { attemptId: '1' },
          }),
        }),
      } as unknown as ExecutionContext;

      await expect(guard.canActivate(context)).rejects.toThrow(mockError);
      expect(quizAttemptService.checkAttempter).toHaveBeenCalledWith(1, 1);
    });
  });
});
