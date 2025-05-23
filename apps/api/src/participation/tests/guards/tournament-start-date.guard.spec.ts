import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TournamentStartDateGuard } from '../../guards/tournament-start-date.guard';
import { TournamentService } from '../../../tournament/tournament.service';
import {
  tournamentLocationEnum,
  TournamentResponsesEnum,
  tournamentTeamTypeEnum,
  tournamentTypeEnum,
} from '^tournament-app/types';

describe('TournamentStartDateGuard', () => {
  let guard: TournamentStartDateGuard;
  let tournamentService: jest.Mocked<TournamentService>;

  const createMockExecutionContext = (
    startDate: Date,
    maxParticipants = 100,
    currentParticipants = 5,
  ): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({
          params: { tournamentId: 1 },
          tournament: {
            id: 1,
            name: 'Test Tournament',
            startDate: startDate.toISOString(),
            maxParticipants,
            currentParticipants,
          },
        }),
      }),
    }) as ExecutionContext;

  beforeEach(async () => {
    const mockTournamentService = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TournamentStartDateGuard,
        {
          provide: TournamentService,
          useValue: mockTournamentService,
        },
      ],
    }).compile();

    guard = module.get<TournamentStartDateGuard>(TournamentStartDateGuard);
    tournamentService = module.get(TournamentService);

    // Mock the parent guard's findOne call to always succeed
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
      startDate: new Date(new Date().getTime() + 1000000),
      location: tournamentLocationEnum.ONLINE,
      type: tournamentTypeEnum.LEAGUE,
    });
  });

  describe('canActivate', () => {
    it('should allow participation before tournament start date', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1); // tomorrow
      const context = createMockExecutionContext(futureDate);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(tournamentService.findOne).toHaveBeenCalledWith(
        1,
        TournamentResponsesEnum.EXTENDED,
      );
    });

    it('should deny participation after tournament start date', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1); // yesterday
      const context = createMockExecutionContext(pastDate);

      await expect(guard.canActivate(context)).rejects.toThrow(
        new ForbiddenException(
          'Cannot participate in a tournament that has already started',
        ),
      );
      expect(tournamentService.findOne).toHaveBeenCalledWith(
        1,
        TournamentResponsesEnum.EXTENDED,
      );
    });

    it('should deny participation on tournament start date', async () => {
      const context = createMockExecutionContext(new Date());

      await expect(guard.canActivate(context)).rejects.toThrow(
        new ForbiddenException(
          'Cannot participate in a tournament that has already started',
        ),
      );
      expect(tournamentService.findOne).toHaveBeenCalledWith(
        1,
        TournamentResponsesEnum.EXTENDED,
      );
    });

    it('should respect parent guard max participants check', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const context = createMockExecutionContext(futureDate, 10, 10);

      // Override the default mock to simulate a full tournament
      tournamentService.findOne.mockResolvedValueOnce({
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
        maxParticipants: 1,
        links: '',
        logo: '',
        name: '',
        startDate: futureDate,
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
  });
});
