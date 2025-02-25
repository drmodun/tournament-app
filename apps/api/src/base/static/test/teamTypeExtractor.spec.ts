import { tournamentTeamTypeEnum } from '@tournament-app/types';
import { TeamTypeExtractor } from '../teamTypeExtractor';

describe('TeamTypeExtractor', () => {
  describe('getTeamTypeFromUrl', () => {
    it('should return SOLO for /apply-solo URLs', () => {
      const url = '/tournaments/1/apply-solo';
      const teamType = TeamTypeExtractor.getTeamTypeFromUrl(url);
      expect(teamType).toBe(tournamentTeamTypeEnum.SOLO);
    });

    it('should return TEAM for /apply-group URLs', () => {
      const url = '/tournaments/1/apply-group';
      const teamType = TeamTypeExtractor.getTeamTypeFromUrl(url);
      expect(teamType).toBe(tournamentTeamTypeEnum.TEAM);
    });

    it('should return SOLO for /admin/apply-solo URLs', () => {
      const url = '/tournaments/1/admin/apply-solo';
      const teamType = TeamTypeExtractor.getTeamTypeFromUrl(url);
      expect(teamType).toBe(tournamentTeamTypeEnum.SOLO);
    });

    it('should return TEAM for /admin/apply-group URLs', () => {
      const url = '/tournaments/1/admin/apply-group';
      const teamType = TeamTypeExtractor.getTeamTypeFromUrl(url);
      expect(teamType).toBe(tournamentTeamTypeEnum.TEAM);
    });

    it('should handle URLs with additional path segments', () => {
      const url = '/api/v1/tournaments/1/apply-solo/extra';
      const teamType = TeamTypeExtractor.getTeamTypeFromUrl(url);
      expect(teamType).toBe(tournamentTeamTypeEnum.SOLO);
    });

    it('should handle URLs with query parameters', () => {
      const url = '/tournaments/1/apply-group?param=value';
      const teamType = TeamTypeExtractor.getTeamTypeFromUrl(url);
      expect(teamType).toBe(tournamentTeamTypeEnum.TEAM);
    });

    it('should throw error for invalid URLs', () => {
      const url = '/tournaments/1/invalid-path';
      expect(() => TeamTypeExtractor.getTeamTypeFromUrl(url)).toThrow(
        'Invalid team type URL',
      );
    });
  });
});
