import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { ConversionRuleService } from '../conversion-rule.service';
import { ConversionRuleDrizzleRepository } from '../conversion-rule.repository';
import { MatchesService } from 'src/matches/matches.service';
import { ParticipationService } from 'src/participation/participation.service';
import {
  pointConversionStrategyEnum,
  pointConversionTypeEnum,
} from '@tournament-app/types';
import { CreateConversionRuleDto } from '../dto/requests.dto';

describe('ConversionRuleService', () => {
  let service: ConversionRuleService;

  const repository = {
    create: jest.fn(),
    findMany: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
    findPending: jest.fn(),
    getStage: jest.fn(),
    getTournament: jest.fn(),
    isTournamentFinished: jest.fn(),
    managesTournament: jest.fn(),
    getRosterParticipations: jest.fn(),
    getTournamentParticipations: jest.fn(),
    applyToStage: jest.fn(),
    applyToTournament: jest.fn(),
    addParticipationPoints: jest.fn(),
    markApplied: jest.fn(),
  };
  const matchesService = { getStandings: jest.fn() };
  const participationService = { create: jest.fn() };

  const organiser = { id: 4, role: 'user' } as any;
  const admin = { id: 1, role: 'admin' } as any;

  const stages = {
    1: { id: 1, tournamentId: 10, stageStatus: 'finished' },
    2: { id: 2, tournamentId: 10, stageStatus: 'upcoming' },
    3: { id: 3, tournamentId: 11, stageStatus: 'upcoming' },
    4: { id: 4, tournamentId: 10, stageStatus: 'ongoing' },
  };

  const stageRule = (
    overrides: Partial<CreateConversionRuleDto> = {},
  ): CreateConversionRuleDto => ({
    type: pointConversionTypeEnum.STAGE_TO_STAGE,
    strategy: pointConversionStrategyEnum.QUALIFICATION,
    source: 1,
    destination: 2,
    to: 2,
    ...overrides,
  });

  beforeEach(async () => {
    jest.resetAllMocks();
    repository.getStage.mockImplementation(async (id: number) => stages[id]);
    repository.getTournament.mockImplementation(async (id: number) =>
      [10, 11].includes(id) ? { id } : undefined,
    );
    repository.managesTournament.mockResolvedValue(true);
    repository.create.mockResolvedValue({ id: 99 });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversionRuleService,
        { provide: ConversionRuleDrizzleRepository, useValue: repository },
        { provide: MatchesService, useValue: matchesService },
        { provide: ParticipationService, useValue: participationService },
      ],
    }).compile();

    service = module.get(ConversionRuleService);
  });

  describe('create', () => {
    it('creates a rule between two stages of one tournament', async () => {
      await expect(service.create(stageRule(), organiser)).resolves.toEqual({
        id: 99,
      });
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({ source: 1, destination: 2, createdBy: 4 }),
      );
      expect(repository.managesTournament).toHaveBeenCalledWith(4, 10);
    });

    it('refuses strategies that are not supported', async () => {
      await expect(
        service.create(
          stageRule({ strategy: pointConversionStrategyEnum.TIE_BREAKER }),
          organiser,
        ),
      ).rejects.toThrow('not supported yet');
    });

    it('refuses seeding into a tournament', async () => {
      await expect(
        service.create(
          stageRule({
            type: pointConversionTypeEnum.STAGE_TO_TOURNAMENT,
            strategy: pointConversionStrategyEnum.SEED,
            destination: 10,
          }),
          organiser,
        ),
      ).rejects.toThrow('needs a stage_to_stage rule');
    });

    it('refuses stages of different tournaments, the same stage and started destinations', async () => {
      await expect(
        service.create(stageRule({ destination: 3 }), organiser),
      ).rejects.toThrow('same tournament');
      await expect(
        service.create(stageRule({ destination: 1 }), organiser),
      ).rejects.toThrow('cannot convert into itself');
      await expect(
        service.create(stageRule({ destination: 4 }), organiser),
      ).rejects.toThrow('has not started');
    });

    it('lets ranking points go to a stage that has started', async () => {
      await expect(
        service.create(
          stageRule({
            strategy: pointConversionStrategyEnum.RANKING,
            destination: 4,
          }),
          organiser,
        ),
      ).resolves.toEqual({ id: 99 });
    });

    it('refuses a range that ends before it starts', async () => {
      await expect(
        service.create(stageRule({ from: 3, to: 2 }), organiser),
      ).rejects.toThrow(BadRequestException);
    });

    it('needs the caller to organise the source and the destination', async () => {
      repository.managesTournament.mockResolvedValue(false);

      await expect(service.create(stageRule(), organiser)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.create(stageRule(), admin)).resolves.toEqual({
        id: 99,
      });
    });

    it('reports a missing source', async () => {
      await expect(
        service.create(stageRule({ source: 404 }), organiser),
      ).rejects.toThrow('The source stage 404 was not found');
    });
  });

  describe('applying', () => {
    it('applies the pending rules of a finished stage to its destination stage', async () => {
      const rule = {
        id: 5,
        ...stageRule(),
        points: 0,
        appliedAt: null,
      };
      repository.findPending
        .mockResolvedValueOnce([rule])
        .mockResolvedValueOnce([]);
      repository.isTournamentFinished.mockResolvedValue(false);
      matchesService.getStandings.mockResolvedValue({
        standings: [
          { rosterId: 21, place: 1 },
          { rosterId: 22, place: 2 },
          { rosterId: 23, place: 3 },
        ],
      });

      await service.onStageFinished({ stageId: 1 });

      expect(repository.applyToStage).toHaveBeenCalledWith(5, 2, [
        expect.objectContaining({ id: 21, qualifies: true }),
        expect.objectContaining({ id: 22, qualifies: true }),
        expect.objectContaining({ id: 23, qualifies: false }),
      ]);
    });

    it('applies tournament rules once every stage of the tournament is finished', async () => {
      repository.findPending.mockResolvedValueOnce([]).mockResolvedValueOnce([
        {
          id: 6,
          type: pointConversionTypeEnum.TOURNAMENT_TO_TOURNAMENT,
          strategy: pointConversionStrategyEnum.QUALIFICATION,
          source: 10,
          destination: 11,
          to: 1,
        },
      ]);
      repository.isTournamentFinished.mockResolvedValue(true);
      repository.getTournamentParticipations.mockResolvedValue([
        { id: 31, points: 4 },
        { id: 32, points: 9 },
      ]);
      repository.applyToTournament.mockResolvedValue([
        { groupId: 8, points: 0 },
      ]);
      participationService.create.mockResolvedValue({ id: 40 });

      await service.onStageFinished({ stageId: 1 });

      expect(repository.findPending).toHaveBeenLastCalledWith(
        [pointConversionTypeEnum.TOURNAMENT_TO_TOURNAMENT],
        10,
      );
      expect(repository.applyToTournament).toHaveBeenCalledWith(11, [
        expect.objectContaining({ id: 32, place: 1, qualifies: true }),
        expect.objectContaining({ id: 31, place: 2, qualifies: false }),
      ]);
      expect(participationService.create).toHaveBeenCalledWith(11, {
        groupId: 8,
      });
      expect(repository.markApplied).toHaveBeenCalledWith(6);
    });

    it('converts stage placings to participations for a tournament destination', async () => {
      const rule = {
        id: 7,
        type: pointConversionTypeEnum.STAGE_TO_TOURNAMENT,
        strategy: pointConversionStrategyEnum.RANKING,
        source: 1,
        destination: 10,
        maxPoints: 10,
        pointsPerPlace: 5,
      };
      matchesService.getStandings.mockResolvedValue({
        standings: [
          { rosterId: 21, place: 1 },
          { rosterId: 22, place: 2 },
        ],
      });
      repository.getRosterParticipations.mockResolvedValue(
        new Map([
          [21, 31],
          [22, 32],
        ]),
      );
      repository.applyToTournament.mockResolvedValue([]);

      await service.apply(rule as any);

      expect(repository.applyToTournament).toHaveBeenCalledWith(10, [
        expect.objectContaining({ id: 31, points: 10 }),
        expect.objectContaining({ id: 32, points: 5 }),
      ]);
    });

    it('applies a rule by hand only once and only after its source finished', async () => {
      repository.findOne.mockResolvedValue({
        id: 5,
        ...stageRule({ source: 4 }),
        appliedAt: null,
      });

      await expect(service.applyNow(5, organiser)).rejects.toThrow(
        'placings are not final',
      );

      repository.findOne.mockResolvedValue({
        id: 5,
        ...stageRule(),
        appliedAt: new Date(),
      });

      await expect(service.applyNow(5, organiser)).rejects.toThrow(
        'already been applied',
      );
    });

    it('keeps going when one rule fails', async () => {
      repository.findPending
        .mockResolvedValueOnce([
          { id: 1, ...stageRule() },
          { id: 2, ...stageRule() },
        ])
        .mockResolvedValueOnce([]);
      matchesService.getStandings
        .mockRejectedValueOnce(new Error('boom'))
        .mockResolvedValueOnce({ standings: [] });

      await service.onStageFinished({ stageId: 1 });

      expect(repository.applyToStage).toHaveBeenCalledTimes(1);
      expect(repository.applyToStage).toHaveBeenCalledWith(2, 2, []);
    });
  });
});
