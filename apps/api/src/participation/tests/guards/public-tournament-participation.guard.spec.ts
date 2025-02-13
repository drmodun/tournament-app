import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PublicTournamentParticipationGuard } from '../../guards/public-tournament-participation.guard';

describe('PublicTournamentParticipationGuard', () => {
  let guard: PublicTournamentParticipationGuard;

  const createMockExecutionContext = (isPublic: boolean): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({
          tournament: {
            id: 1,
            name: 'Test Tournament',
            isPublic,
          },
        }),
      }),
    }) as ExecutionContext;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PublicTournamentParticipationGuard],
    }).compile();

    guard = module.get<PublicTournamentParticipationGuard>(
      PublicTournamentParticipationGuard,
    );
  });

  describe('canActivate', () => {
    it('should allow participation when tournament is public', async () => {
      const context = createMockExecutionContext(true);
      const result = await guard.canActivate(context);
      expect(result).toBe(true);
    });

    it('should deny participation when tournament is not public', async () => {
      const context = createMockExecutionContext(false);
      await expect(guard.canActivate(context)).rejects.toThrow(
        new ForbiddenException('Tournament is not public.'),
      );
    });

    it('should deny participation when tournament is undefined', async () => {
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({
            tournament: undefined,
          }),
        }),
      } as ExecutionContext;

      await expect(guard.canActivate(context)).rejects.toThrow(
        new ForbiddenException('Tournament is not public.'),
      );
    });
  });
});
