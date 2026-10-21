import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  pointConversionStrategyEnum,
  pointConversionTypeEnum,
  stageStatusEnum,
  userRoleEnum,
} from '@tournament-app/types';
import { ValidatedUserDto } from 'src/auth/dto/validatedUser.dto';
import {
  MatchesService,
  STAGE_FINISHED_EVENT,
} from 'src/matches/matches.service';
import { ParticipationService } from 'src/participation/participation.service';
import {
  noEffects,
  Placing,
  placingsByPoints,
  planConversion,
  SUPPORTED_STRATEGIES,
} from './conversion';
import {
  ConversionRule,
  ConversionRuleDrizzleRepository,
} from './conversion-rule.repository';
import {
  ConversionRuleQuery,
  CreateConversionRuleDto,
} from './dto/requests.dto';

// These put entries into the destination, so a destination stage must not have started
const QUALIFYING_STRATEGIES: string[] = [
  pointConversionStrategyEnum.QUALIFICATION,
  pointConversionStrategyEnum.ELIMINATION,
  pointConversionStrategyEnum.SEED,
  pointConversionStrategyEnum.HYBRID,
  pointConversionStrategyEnum.TIE_BREAKER,
  pointConversionStrategyEnum.QUALIFICATION_WITH_LCQ,
];

// Seeds, removals and last-chance stages are about rosters in a stage
const STAGE_ONLY_STRATEGIES: string[] = [
  pointConversionStrategyEnum.ELIMINATION,
  pointConversionStrategyEnum.SEED,
  pointConversionStrategyEnum.QUALIFICATION_WITH_LCQ,
];

const isStageSource = (type: string) =>
  type === pointConversionTypeEnum.STAGE_TO_STAGE ||
  type === pointConversionTypeEnum.STAGE_TO_TOURNAMENT;

@Injectable()
export class ConversionRuleService {
  private readonly logger = new Logger(ConversionRuleService.name);

  constructor(
    private readonly repository: ConversionRuleDrizzleRepository,
    private readonly matchesService: MatchesService,
    private readonly participationService: ParticipationService,
  ) {}

  async create(dto: CreateConversionRuleDto, user: ValidatedUserDto) {
    if (!SUPPORTED_STRATEGIES.includes(dto.strategy)) {
      throw new BadRequestException(
        `The ${dto.strategy} strategy is not supported yet`,
      );
    }

    if (
      STAGE_ONLY_STRATEGIES.includes(dto.strategy) &&
      dto.type !== pointConversionTypeEnum.STAGE_TO_STAGE
    ) {
      throw new BadRequestException(
        `The ${dto.strategy} strategy needs a stage_to_stage rule`,
      );
    }

    if (dto.from != null && dto.to != null && dto.from > dto.to) {
      throw new BadRequestException('`from` must not be after `to`');
    }

    const isLastChance =
      dto.strategy === pointConversionStrategyEnum.QUALIFICATION_WITH_LCQ;

    if (isLastChance && (dto.lastChanceDestination == null || dto.to == null)) {
      throw new BadRequestException(
        'A qualification_with_lcq rule needs `to` and a `lastChanceDestination` stage',
      );
    }

    if (!isLastChance && dto.lastChanceDestination != null) {
      throw new BadRequestException(
        '`lastChanceDestination` is only for qualification_with_lcq rules',
      );
    }

    const sourceTournamentId = await this.tournamentOf(
      dto.type,
      dto.source,
      'source',
    );
    const destinationTournamentId = await this.destinationTournamentOf(dto);

    await this.checkManages(user, sourceTournamentId);
    await this.checkManages(user, destinationTournamentId);

    return this.repository.create({
      ...dto,
      createdBy: user.id,
    } as Parameters<ConversionRuleDrizzleRepository['create']>[0]);
  }

  async findAll(query: ConversionRuleQuery) {
    return this.repository.findMany(query);
  }

  async findOne(id: number) {
    const rule = await this.repository.findOne(id);

    if (!rule) {
      throw new NotFoundException(`Conversion rule with ID ${id} not found`);
    }

    return rule;
  }

  async remove(id: number, user: ValidatedUserDto) {
    const rule = await this.findOne(id);

    await this.checkManages(
      user,
      await this.tournamentOf(rule.type, rule.source, 'source'),
    );

    return this.repository.delete(id);
  }

  // For stages whose status was set by hand, such as those run on Challonge
  async applyNow(id: number, user: ValidatedUserDto) {
    const rule = await this.findOne(id);

    await this.checkManages(
      user,
      await this.tournamentOf(rule.type, rule.source, 'source'),
    );

    if (rule.appliedAt) {
      throw new BadRequestException('This rule has already been applied');
    }

    if (!(await this.isSourceFinished(rule))) {
      throw new BadRequestException(
        'The source has not finished, so its placings are not final',
      );
    }

    await this.apply(rule);

    return this.findOne(id);
  }

  @OnEvent(STAGE_FINISHED_EVENT, { promisify: true })
  async onStageFinished({ stageId }: { stageId: number }) {
    await this.applyPending(
      [
        pointConversionTypeEnum.STAGE_TO_STAGE,
        pointConversionTypeEnum.STAGE_TO_TOURNAMENT,
      ],
      stageId,
    );

    const stage = await this.repository.getStage(stageId);

    if (
      stage?.tournamentId &&
      (await this.repository.isTournamentFinished(stage.tournamentId))
    ) {
      await this.applyPending(
        [pointConversionTypeEnum.TOURNAMENT_TO_TOURNAMENT],
        stage.tournamentId,
      );
    }
  }

  private async applyPending(types: string[], source: number) {
    for (const rule of await this.repository.findPending(types, source)) {
      try {
        await this.apply(rule);
      } catch (error) {
        this.logger.error(`Failed to apply conversion rule ${rule.id}`, error);
      }
    }
  }

  async apply(rule: ConversionRule) {
    const outcomes = planConversion(rule, await this.placingsOf(rule));

    if (rule.type === pointConversionTypeEnum.STAGE_TO_STAGE) {
      const targets = [{ stageId: rule.destination, outcomes }];

      // The places after the range enter the last-chance stage, carrying nothing
      if (rule.lastChanceDestination != null) {
        targets.push({
          stageId: rule.lastChanceDestination,
          outcomes: outcomes.map((outcome) => ({
            ...outcome,
            points: 0,
            seed: null,
            isRemoved: false,
            qualifies: outcome.toLastChance,
          })),
        });
      }

      await this.repository.applyToStages(rule.id, targets);
      return;
    }

    const { missing, participationPoints } =
      await this.repository.applyToTournament(rule.destination, outcomes);
    const effects = { ...noEffects(), participationPoints };

    // Created the usual way, so players entering alone get their rosters
    for (const { points, ...entrant } of missing) {
      const created = await this.participationService.create(
        rule.destination,
        entrant,
      );
      effects.createdParticipations.push(created.id as number);
      await this.repository.addParticipationPoints(
        created.id as number,
        points,
      );
    }

    await this.repository.markApplied(rule.id, effects);
  }

  /**
   * Puts a finished stage back in play so its results can be corrected: undoes the conversion rules
   * that ran when it finished (and those of its tournament, which finished with it). They run again
   * when the stage finishes again. Refused while anything those rules fed has started.
   */
  async reopenStage(stageId: number, user: ValidatedUserDto) {
    const stage = await this.repository.getStage(stageId);

    if (!stage) {
      throw new NotFoundException(`Stage with ID ${stageId} not found`);
    }

    await this.checkManages(user, stage.tournamentId);

    if (stage.stageStatus !== stageStatusEnum.FINISHED) {
      throw new BadRequestException('Only a finished stage can be reopened');
    }

    const rules = await this.repository.findApplied(
      [stageId],
      [stage.tournamentId],
    );

    for (const rule of rules) {
      await this.checkCanUndo(rule, user);
    }

    await this.repository.reopenStage(stageId, rules);

    return { id: stageId, stageStatus: stageStatusEnum.ONGOING };
  }

  private async checkCanUndo(rule: ConversionRule, user: ValidatedUserDto) {
    if (!rule.effects) {
      throw new BadRequestException(
        `Conversion rule ${rule.id} was applied before its changes were recorded, so it cannot be undone`,
      );
    }

    await this.checkManages(
      user,
      await this.tournamentOf(rule.type, rule.destination, 'destination'),
    );

    if (rule.type === pointConversionTypeEnum.STAGE_TO_STAGE) {
      // Points can come back out of a stage in play; entries, seeds and removals only before the draw
      const changesEntries =
        rule.effects.createdRosters.length > 0 ||
        rule.effects.removedRosters.length > 0 ||
        rule.effects.seeds.length > 0;

      for (const stageId of [rule.destination, rule.lastChanceDestination]) {
        const destination =
          stageId != null ? await this.repository.getStage(stageId) : null;

        if (
          destination &&
          (destination.stageStatus === stageStatusEnum.FINISHED ||
            (changesEntries &&
              destination.stageStatus !== stageStatusEnum.UPCOMING))
        ) {
          throw new BadRequestException(
            `Stage ${stageId}, which conversion rule ${rule.id} fed, has already ${destination.stageStatus === stageStatusEnum.FINISHED ? 'finished' : 'started'}`,
          );
        }
      }
      return;
    }

    if (
      rule.effects.createdParticipations.length &&
      (await this.repository.hasTournamentStarted(rule.destination))
    ) {
      throw new BadRequestException(
        `Tournament ${rule.destination}, which conversion rule ${rule.id} entered participants into, has already started`,
      );
    }

    if (await this.repository.isTournamentFinished(rule.destination)) {
      throw new BadRequestException(
        `Tournament ${rule.destination}, which conversion rule ${rule.id} fed, has already finished`,
      );
    }
  }

  // Stage sources place their rosters (participations for a tournament destination); tournament
  // sources place participations by points
  private async placingsOf(rule: ConversionRule): Promise<Placing[]> {
    if (!isStageSource(rule.type)) {
      return placingsByPoints(
        (await this.repository.getTournamentParticipations(rule.source)).map(
          (entry) => ({ id: entry.id, points: entry.points ?? 0 }),
        ),
      );
    }

    const { standings } = await this.matchesService.getStandings(rule.source);
    const placings = standings.map((row) => ({
      id: row.rosterId,
      place: row.place,
    }));

    if (rule.type === pointConversionTypeEnum.STAGE_TO_STAGE) {
      return placings;
    }

    const participations = await this.repository.getRosterParticipations(
      placings.map((placing) => placing.id),
    );
    const best = new Map<number, number>();

    for (const { id, place } of placings) {
      const participationId = participations.get(id);
      if (participationId != null && !best.has(participationId)) {
        best.set(participationId, place);
      }
    }

    return [...best].map(([id, place]) => ({ id, place }));
  }

  private async isSourceFinished(rule: ConversionRule) {
    if (isStageSource(rule.type)) {
      const stage = await this.repository.getStage(rule.source);
      return stage?.stageStatus === stageStatusEnum.FINISHED;
    }

    return this.repository.isTournamentFinished(rule.source);
  }

  private async tournamentOf(
    type: string,
    id: number,
    role: 'source' | 'destination',
  ) {
    const isStage =
      role === 'source'
        ? isStageSource(type)
        : type === pointConversionTypeEnum.STAGE_TO_STAGE;

    if (isStage) {
      const stage = await this.repository.getStage(id);

      if (!stage) {
        throw new NotFoundException(`The ${role} stage ${id} was not found`);
      }

      return stage.tournamentId;
    }

    if (!(await this.repository.getTournament(id))) {
      throw new NotFoundException(`The ${role} tournament ${id} was not found`);
    }

    return id;
  }

  private async destinationTournamentOf(dto: CreateConversionRuleDto) {
    const tournamentId = await this.tournamentOf(
      dto.type,
      dto.destination,
      'destination',
    );

    if (dto.type !== pointConversionTypeEnum.STAGE_TO_STAGE) {
      if (
        dto.type === pointConversionTypeEnum.TOURNAMENT_TO_TOURNAMENT &&
        dto.source === dto.destination
      ) {
        throw new BadRequestException(
          'A tournament cannot convert into itself',
        );
      }
      return tournamentId;
    }

    const source = await this.repository.getStage(dto.source);
    const destination = await this.repository.getStage(dto.destination);

    if (dto.source === dto.destination) {
      throw new BadRequestException('A stage cannot convert into itself');
    }

    // Rosters belong to a participation in the stage's tournament
    if (source.tournamentId !== destination.tournamentId) {
      throw new BadRequestException(
        'Both stages of a stage_to_stage rule must be in the same tournament',
      );
    }

    if (
      QUALIFYING_STRATEGIES.includes(dto.strategy) &&
      destination.stageStatus !== stageStatusEnum.UPCOMING
    ) {
      throw new BadRequestException(
        'Entries can only be added to a stage that has not started',
      );
    }

    if (dto.lastChanceDestination != null) {
      await this.checkLastChanceStage(dto, source.tournamentId);
    }

    return tournamentId;
  }

  private async checkLastChanceStage(
    dto: CreateConversionRuleDto,
    tournamentId: number,
  ) {
    const lastChance = await this.repository.getStage(
      dto.lastChanceDestination,
    );

    if (!lastChance) {
      throw new NotFoundException(
        `The last-chance stage ${dto.lastChanceDestination} was not found`,
      );
    }

    if (
      dto.lastChanceDestination === dto.source ||
      dto.lastChanceDestination === dto.destination
    ) {
      throw new BadRequestException(
        'The last-chance stage must differ from the source and the destination',
      );
    }

    if (lastChance.tournamentId !== tournamentId) {
      throw new BadRequestException(
        'The last-chance stage must be in the same tournament',
      );
    }

    if (lastChance.stageStatus !== stageStatusEnum.UPCOMING) {
      throw new BadRequestException(
        'Entries can only be added to a stage that has not started',
      );
    }
  }

  private async checkManages(user: ValidatedUserDto, tournamentId: number) {
    if (user.role === userRoleEnum.ADMIN) {
      return;
    }

    if (!(await this.repository.managesTournament(user.id, tournamentId))) {
      throw new ForbiddenException(
        'Only the organisers of both the source and the destination can manage this rule',
      );
    }
  }
}
