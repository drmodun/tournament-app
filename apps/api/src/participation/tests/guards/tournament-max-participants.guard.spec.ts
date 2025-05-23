import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TournamentMaximumParticipantsGuard } from '../../guards/tournament-max-participants.guard';
import { TournamentService } from '../../../tournament/tournament.service';
import {
  tournamentLocationEnum,
  TournamentResponsesEnum,
  tournamentTeamTypeEnum,
  tournamentTypeEnum,
} from '^tournament-app/types';

describe('TournamentMaximumParticipantsGuard', () => {
  let guard: TournamentMaximumParticipantsGuard;
  let tournamentService: jest.Mocked<TournamentService>;

  const createMockExecutionContext = (
    tournamentId: number,
    paramLocation: 'params' | 'body' | 'query' = 'params',
  ): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({
          params: paramLocation === 'params' ? { tournamentId } : {},
          body: paramLocation === 'body' ? { tournamentId } : {},
          query: paramLocation === 'query' ? { tournamentId } : {},
        }),
      }),
    }) as ExecutionContext;

  beforeEach(async () => {
    const mockTournamentService = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TournamentMaximumParticipantsGuard,
        {
          provide: TournamentService,
          useValue: mockTournamentService,
        },
      ],
    }).compile();

    guard = module.get<TournamentMaximumParticipantsGuard>(
      TournamentMaximumParticipantsGuard,
    );
    tournamentService = module.get(TournamentService);
  });

  describe('canActivate', () => {
    it('should allow participation when tournament has space', async () => {
      const context = createMockExecutionContext(1);
      tournamentService.findOne.mockResolvedValue({
        id: 1,
        creator: { id: 999, username: 'creator', isFake: false },
        affiliatedGroup: { id: 1, abbreviation: 'group', name: 'Group' },
        category: {
          id: 1,
          logo: 'https://example.com/logo.jpg',
          name: 'Chess',
        },
        categoryId: 1,
        country: 'Croatia',
        endDate: new Date(),
        isMultipleTeamsPerGroupAllowed: false,
        isFakePlayersAllowed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        conversionRuleId: 1,
        isRanked: true,
        maximumMMR: 1000,
        minimumMMR: 500,
        teamType: tournamentTeamTypeEnum.SOLO,
        description: '',
        isPublic: true,
        currentParticipants: 1,
        maxParticipants: 100,
        links: '',
        logo: '',
        name: '',
        startDate: new Date(),
        location: tournamentLocationEnum.ONLINE,
        type: tournamentTypeEnum.LEAGUE,
      });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(tournamentService.findOne).toHaveBeenCalledWith(
        1,
        TournamentResponsesEnum.EXTENDED,
      );
    });

    it('should deny participation when tournament is full', async () => {
      const context = createMockExecutionContext(1);
      tournamentService.findOne.mockResolvedValue({
        id: 1,
        creator: { id: 999, username: 'creator', isFake: false },
        affiliatedGroup: { id: 1, abbreviation: 'group', name: 'Group' },
        category: {
          id: 1,
          logo: 'https://example.com/logo.jpg',
          name: 'Chess',
        },
        categoryId: 1,
        country: 'Croatia',
        endDate: new Date(),
        isMultipleTeamsPerGroupAllowed: false,
        isFakePlayersAllowed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        conversionRuleId: 1,
        isRanked: true,
        maximumMMR: 1000,
        minimumMMR: 500,
        teamType: tournamentTeamTypeEnum.SOLO,
        description: '',
        isPublic: true,
        currentParticipants: 100,
        maxParticipants: 100,
        links: '',
        logo: '',
        name: '',
        startDate: new Date(),
        location: tournamentLocationEnum.ONLINE,
        type: tournamentTypeEnum.LEAGUE,
      });

      await expect(guard.canActivate(context)).rejects.toThrow(
        new ForbiddenException('Maximum number of participants reached.'),
      );
      expect(tournamentService.findOne).toHaveBeenCalledWith(
        1,
        TournamentResponsesEnum.EXTENDED,
      );
    });

    it('should find tournamentId from body if not in params', async () => {
      const context = createMockExecutionContext(1, 'body');
      tournamentService.findOne.mockResolvedValue({
        id: 1,
        creator: { id: 999, username: 'creator', isFake: false },
        affiliatedGroup: { id: 1, abbreviation: 'group', name: 'Group' },
        category: {
          id: 1,
          logo: 'https://example.com/logo.jpg',
          name: 'Chess',
        },
        categoryId: 1,
        country: 'Croatia',
        endDate: new Date(),
        isMultipleTeamsPerGroupAllowed: false,
        isFakePlayersAllowed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        conversionRuleId: 1,
        isRanked: true,
        maximumMMR: 1000,
        minimumMMR: 500,
        teamType: tournamentTeamTypeEnum.SOLO,
        description: '',
        isPublic: true,
        currentParticipants: 1,
        maxParticipants: 100,
        links: '',
        logo: '',
        name: '',
        startDate: new Date(),
        location: tournamentLocationEnum.ONLINE,
        type: tournamentTypeEnum.LEAGUE,
      });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(tournamentService.findOne).toHaveBeenCalledWith(
        1,
        TournamentResponsesEnum.EXTENDED,
      );
    });

    it('should find tournamentId from query if not in params or body', async () => {
      const context = createMockExecutionContext(1, 'query');
      tournamentService.findOne.mockResolvedValue({
        id: 1,
        creator: { id: 999, username: 'creator', isFake: false },
        affiliatedGroup: { id: 1, abbreviation: 'group', name: 'Group' },
        category: {
          id: 1,
          logo: 'https://example.com/logo.jpg',
          name: 'Chess',
        },
        categoryId: 1,
        country: 'Croatia',
        endDate: new Date(),
        isMultipleTeamsPerGroupAllowed: false,
        isFakePlayersAllowed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        conversionRuleId: 1,
        isRanked: true,
        maximumMMR: 1000,
        minimumMMR: 500,
        teamType: tournamentTeamTypeEnum.SOLO,
        description: '',
        isPublic: true,
        currentParticipants: 1,
        maxParticipants: 100,
        links: '',
        logo: '',
        name: '',
        startDate: new Date(),
        location: tournamentLocationEnum.ONLINE,
        type: tournamentTypeEnum.LEAGUE,
      });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(tournamentService.findOne).toHaveBeenCalledWith(
        1,
        TournamentResponsesEnum.EXTENDED,
      );
    });

    it('should handle undefined currentParticipants', async () => {
      const context = createMockExecutionContext(1);
      tournamentService.findOne.mockResolvedValue({
        id: 1,
        creator: { id: 999, username: 'creator', isFake: false },
        affiliatedGroup: { id: 1, abbreviation: 'group', name: 'Group' },
        category: {
          id: 1,
          logo: 'https://example.com/logo.jpg',
          name: 'Chess',
        },
        categoryId: 1,
        country: 'Croatia',
        endDate: new Date(),
        isMultipleTeamsPerGroupAllowed: false,
        isFakePlayersAllowed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        conversionRuleId: 1,
        isRanked: true,
        maximumMMR: 1000,
        minimumMMR: 500,
        teamType: tournamentTeamTypeEnum.SOLO,
        description: '',
        isPublic: true,
        currentParticipants: 1,
        maxParticipants: 100,
        links: '',
        logo: '',
        name: '',
        startDate: new Date(),
        location: tournamentLocationEnum.ONLINE,
        type: tournamentTypeEnum.LEAGUE,
      });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(tournamentService.findOne).toHaveBeenCalledWith(
        1,
        TournamentResponsesEnum.EXTENDED,
      );
    });
  });
});
