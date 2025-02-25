import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TeamTypeTournamentParticipationGuard } from '../../guards/team-type-tournament-participation.guard';
import { tournamentTeamTypeEnum } from '@tournament-app/types';
import { TeamTypeExtractor } from 'src/base/static/teamTypeExtractor';

describe('TeamTypeTournamentParticipationGuard', () => {
  let guard: TeamTypeTournamentParticipationGuard;

  const createMockExecutionContext = (
    tournamentType: tournamentTeamTypeEnum,
    originalUrl: string,
  ): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({
          tournament: {
            id: 1,
            name: 'Test Tournament',
            teamType: tournamentType,
          },
          originalUrl,
        }),
      }),
    }) as ExecutionContext;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TeamTypeTournamentParticipationGuard],
    }).compile();

    guard = module.get<TeamTypeTournamentParticipationGuard>(
      TeamTypeTournamentParticipationGuard,
    );
  });

  describe('getTeamTypeFromUrl', () => {
    it('should return SOLO for solo application URL', () => {
      const result = TeamTypeExtractor.getTeamTypeFromUrl(
        '/participations/apply-solo/1',
      );
      expect(result).toBe(tournamentTeamTypeEnum.SOLO);
    });

    it('should return TEAM for team application URL', () => {
      const result = TeamTypeExtractor.getTeamTypeFromUrl(
        '/participations/apply-group/1/1',
      );
      expect(result).toBe(tournamentTeamTypeEnum.TEAM);
    });

    it('should throw error for invalid URL', () => {
      expect(() =>
        TeamTypeExtractor.getTeamTypeFromUrl('/invalid-url'),
      ).toThrow(ForbiddenException);
    });
  });

  describe('canActivate', () => {
    it('should allow solo participation in solo tournament', async () => {
      const context = createMockExecutionContext(
        tournamentTeamTypeEnum.SOLO,
        '/participations/apply-solo/1',
      );
      const result = await guard.canActivate(context);
      expect(result).toBe(true);
    });

    it('should allow team participation in team tournament', async () => {
      const context = createMockExecutionContext(
        tournamentTeamTypeEnum.TEAM,
        '/participations/apply-group/1/1',
      );
      const result = await guard.canActivate(context);
      expect(result).toBe(true);
    });

    it('should deny solo participation in team tournament', async () => {
      const context = createMockExecutionContext(
        tournamentTeamTypeEnum.TEAM,
        '/participations/apply-solo/1',
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        new ForbiddenException(
          'This tournament does not allow solo applications',
        ),
      );
    });

    it('should deny team participation in solo tournament', async () => {
      const context = createMockExecutionContext(
        tournamentTeamTypeEnum.SOLO,
        '/participations/apply-group/1/1',
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        new ForbiddenException(
          'This tournament does not allow team applications',
        ),
      );
    });
  });
});
