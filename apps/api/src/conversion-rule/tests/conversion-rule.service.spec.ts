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
    applyToStages: jest.fn(),
    applyToTournament: jest.fn(),
    addParticipationPoints: jest.fn(),
    markApplied: jest.fn(),
    findApplied: jest.fn(),
    hasTournamentStarted: jest.fn(),
    reopenStage: jest.fn(),
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
    5: { id: 5, tournamentId: 10, stageStatus: 'upcoming' },
    6: { id: 6, tournamentId: 10, stageStatus: 'finished' },
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

    it('creates a tie-breaker rule', async () => {
      await expect(
        service.create(
          stageRule({ strategy: pointConversionStrategyEnum.TIE_BREAKER }),
          organiser,
        ),
      ).resolves.toEqual({ id: 99 });
    });

    it('creates a qualification with a last-chance stage', async () => {
      await expect(
        service.create(
          stageRule({
            strategy: pointConversionStrategyEnum.QUALIFICATION_WITH_LCQ,
            lastChanceDestination: 5,
          }),
          organiser,
        ),
      ).resolves.toEqual({ id: 99 });
    });

    it('refuses a last-chance stage that is missing, misplaced or started', async () => {
      const lastChance = (overrides: Partial<CreateConversionRuleDto>) =>
        service.create(
          stageRule({
            strategy: pointConversionStrategyEnum.QUALIFICATION_WITH_LCQ,
            lastChanceDestination: 5,
            ...overrides,
          }),
          organiser,
        );

      await expect(
        lastChance({ lastChanceDestination: undefined }),
      ).rejects.toThrow('needs `to` and a `lastChanceDestination`');
      await expect(lastChance({ to: undefined })).rejects.toThrow('needs `to`');
      await expect(lastChance({ lastChanceDestination: 2 })).rejects.toThrow(
        'must differ',
      );
      await expect(lastChance({ lastChanceDestination: 3 })).rejects.toThrow(
        'same tournament',
      );
      await expect(lastChance({ lastChanceDestination: 4 })).rejects.toThrow(
        'has not started',
      );
      await expect(lastChance({ lastChanceDestination: 404 })).rejects.toThrow(
        'was not found',
      );
      await expect(
        lastChance({ type: pointConversionTypeEnum.STAGE_TO_TOURNAMENT }),
      ).rejects.toThrow('needs a stage_to_stage rule');
    });

    it('refuses a last-chance stage on other strategies', async () => {
      await expect(
        service.create(stageRule({ lastChanceDestination: 5 }), organiser),
      ).rejects.toThrow('only for qualification_with_lcq');
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

      expect(repository.applyToStages).toHaveBeenCalledWith(5, [
        {
          stageId: 2,
          outcomes: [
            expect.objectContaining({ id: 21, qualifies: true }),
            expect.objectContaining({ id: 22, qualifies: true }),
            expect.objectContaining({ id: 23, qualifies: false }),
          ],
        },
      ]);
    });

    it('enters the places after the range into the last-chance stage', async () => {
      matchesService.getStandings.mockResolvedValue({
        standings: [
          { rosterId: 21, place: 1 },
          { rosterId: 22, place: 2 },
          { rosterId: 23, place: 3 },
        ],
      });

      await service.apply({
        id: 8,
        ...stageRule({
          strategy: pointConversionStrategyEnum.QUALIFICATION_WITH_LCQ,
          to: 1,
          lastChanceDestination: 5,
        }),
      } as any);

      const [, targets] = repository.applyToStages.mock.calls[0];
      const qualifiers = (index: number) =>
        targets[index].outcomes
          .filter((outcome) => outcome.qualifies)
          .map((outcome) => outcome.id);

      expect(targets.map((target) => target.stageId)).toEqual([2, 5]);
      expect(qualifiers(0)).toEqual([21]);
      expect(qualifiers(1)).toEqual([22, 23]);
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
      repository.applyToTournament.mockResolvedValue({
        missing: [{ groupId: 8, points: 0 }],
        participationPoints: [],
      });
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
      expect(repository.markApplied).toHaveBeenCalledWith(
        6,
        expect.objectContaining({ createdParticipations: [40] }),
      );
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
      repository.applyToTournament.mockResolvedValue({
        missing: [],
        participationPoints: [],
      });

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

      expect(repository.applyToStages).toHaveBeenCalledTimes(1);
      expect(repository.applyToStages).toHaveBeenCalledWith(2, [
        { stageId: 2, outcomes: [] },
      ]);
    });
  });

  describe('reopenStage', () => {
    const effects = (overrides = {}) => ({
      createdRosters: [],
      rosterPoints: [],
      seeds: [],
      removedRosters: [],
      createdParticipations: [],
      participationPoints: [],
      ...overrides,
    });
    const applied = (overrides = {}) => ({
      id: 5,
      ...stageRule(),
      lastChanceDestination: null,
      appliedAt: new Date(),
      effects: effects({ createdRosters: [40] }),
      ...overrides,
    });

    it('undoes the applied rules and puts the stage back in play', async () => {
      const rules = [applied()];
      repository.findApplied.mockResolvedValue(rules);

      await expect(service.reopenStage(1, organiser)).resolves.toEqual({
        id: 1,
        stageStatus: 'ongoing',
      });
      expect(repository.findApplied).toHaveBeenCalledWith([1], [10]);
      expect(repository.reopenStage).toHaveBeenCalledWith(1, rules);
    });

    it('only reopens a finished stage', async () => {
      await expect(service.reopenStage(4, organiser)).rejects.toThrow(
        'Only a finished stage',
      );
      await expect(service.reopenStage(404, organiser)).rejects.toThrow(
        'not found',
      );
    });

    it('is for the organisers', async () => {
      repository.managesTournament.mockResolvedValue(false);

      await expect(service.reopenStage(1, organiser)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('refuses once a stage the rules entered rosters into has started', async () => {
      repository.findApplied.mockResolvedValue([applied({ destination: 4 })]);

      await expect(service.reopenStage(1, organiser)).rejects.toThrow(
        'has already started',
      );
      expect(repository.reopenStage).not.toHaveBeenCalled();
    });

    it('takes points back out of a stage in play, but not a finished one', async () => {
      const points = effects({ rosterPoints: [{ rosterId: 40, points: 3 }] });

      repository.findApplied.mockResolvedValue([
        applied({ destination: 4, effects: points }),
      ]);
      await expect(service.reopenStage(1, organiser)).resolves.toBeDefined();

      repository.findApplied.mockResolvedValue([
        applied({ destination: 6, effects: points }),
      ]);
      await expect(service.reopenStage(1, organiser)).rejects.toThrow(
        'has already finished',
      );
    });

    it('checks the last-chance stage too', async () => {
      repository.findApplied.mockResolvedValue([
        applied({ lastChanceDestination: 4 }),
      ]);

      await expect(service.reopenStage(1, organiser)).rejects.toThrow(
        'Stage 4',
      );
    });

    it('refuses rules applied before their changes were recorded', async () => {
      repository.findApplied.mockResolvedValue([applied({ effects: null })]);

      await expect(service.reopenStage(1, organiser)).rejects.toThrow(
        'cannot be undone',
      );
    });

    it('checks tournament destinations', async () => {
      const tournamentRule = (ruleEffects) =>
        applied({
          type: pointConversionTypeEnum.TOURNAMENT_TO_TOURNAMENT,
          source: 10,
          destination: 11,
          effects: ruleEffects,
        });

      repository.findApplied.mockResolvedValue([
        tournamentRule(effects({ createdParticipations: [7] })),
      ]);
      repository.hasTournamentStarted.mockResolvedValue(true);
      await expect(service.reopenStage(1, admin)).rejects.toThrow(
        'entered participants into, has already started',
      );

      repository.findApplied.mockResolvedValue([
        tournamentRule(
          effects({ participationPoints: [{ participationId: 7, points: 2 }] }),
        ),
      ]);
      repository.isTournamentFinished.mockResolvedValue(true);
      await expect(service.reopenStage(1, admin)).rejects.toThrow(
        'has already finished',
      );

      repository.isTournamentFinished.mockResolvedValue(false);
      await expect(service.reopenStage(1, admin)).resolves.toBeDefined();
    });
  });
});
