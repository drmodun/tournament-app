import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, NotFoundException } from '@nestjs/common';
import { CanAccessAttemptGuard } from '../guards/can-access-attempt.guard';
import { QuizAttemptService } from '../quiz-attempt.service';
import { createMock } from '@golevelup/ts-jest';

describe('CanAccessAttemptGuard', () => {
  let guard: CanAccessAttemptGuard;
  let service: QuizAttemptService;

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
    service = module.get<QuizAttemptService>(QuizAttemptService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true for admin users without checking ownership', async () => {
      // Create mock execution context with admin user
      const context = createMock<ExecutionContext>({
        switchToHttp: () => ({
          getRequest: () => ({
            user: { id: 1, role: 'admin' },
            params: { attemptId: '1' },
          }),
        }),
      });

      const result = await guard.canActivate(context);

      // Admin should be allowed, and service should not be called
      expect(result).toBe(true);
      expect(service.checkAttempter).not.toHaveBeenCalled();
    });

    it('should check ownership for non-admin users and return true if owner', async () => {
      // Create mock context with non-admin user
      const context = createMock<ExecutionContext>({
        switchToHttp: () => ({
          getRequest: () => ({
            user: { id: 1, role: 'user' },
            params: { attemptId: '1' },
          }),
        }),
      });

      // Mock service response
      jest.spyOn(service, 'checkAttempter').mockResolvedValue(undefined);

      const result = await guard.canActivate(context);

      // Should check ownership and return true
      expect(result).toBe(true);
      expect(service.checkAttempter).toHaveBeenCalledWith(1, 1);
    });

    it('should throw error if attemptId is not provided', async () => {
      // Create mock context without attemptId
      const context = createMock<ExecutionContext>({
        switchToHttp: () => ({
          getRequest: () => ({
            user: { id: 1, role: 'user' },
            params: {}, // No attemptId
          }),
        }),
      });

      // Should throw error when attemptId is missing
      await expect(guard.canActivate(context)).rejects.toThrow(
        NotFoundException,
      );
      expect(service.checkAttempter).not.toHaveBeenCalled();
    });

    it('should propagate error if service throws error', async () => {
      // Create mock context
      const context = createMock<ExecutionContext>({
        switchToHttp: () => ({
          getRequest: () => ({
            user: { id: 1, role: 'user' },
            params: { attemptId: '1' },
          }),
        }),
      });

      // Mock service throwing error
      const error = new Error('Not owner');
      jest.spyOn(service, 'checkAttempter').mockRejectedValue(error);

      // Should propagate error from service
      await expect(guard.canActivate(context)).rejects.toThrow(error);
      expect(service.checkAttempter).toHaveBeenCalledWith(1, 1);
    });
  });
});
