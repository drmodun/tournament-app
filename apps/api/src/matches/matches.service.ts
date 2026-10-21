import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MatchesDrizzleRepository } from './matches.repository';
import { isChallongeEnabled } from 'src/challonge/enabled';
import { ChallongeService } from '../challonge/challonge.service';
import {
  IChallongeMatch,
  matchScoreToChallongeScoreRequest,
  IEndMatchupRequest,
  IMiniRosterResponse,
  IStageStandingsResponse,
  stageStatusEnum,
  stageTypeEnum,
} from '@tournament-app/types';
import { QueryMatchupRequestDto } from './dto/requests';
import { PaginationOnly } from 'src/base/query/baseQuery';
import { RosterService } from 'src/roster/roster.service';
import { CareerService } from 'src/career/career.service';
import {
  mapMatchupsWithResults,
  mapMatchupWithResultsAndScores,
  RawMatchupWithScores,
} from './matches.mappers';
import { firstRoundPairings, nextRoundPairings } from './localBracket';
import {
  bracketFormatFor,
  compassFirstRound,
  compassNextRound,
  computeStandings,
  doubleEliminationFirstRound,
  doubleEliminationNextRound,
  isElimination,
  LocalBracketFormat,
  LocalMatchup,
  Pairing,
  roundRobinRounds,
  swissFirstRound,
  swissNextRound,
  swissRoundCount,
  tripleEliminationNextRound,
} from './bracketFormats';

// Emitted with { stageId } when a stage run by the API is over
export const STAGE_FINISHED_EVENT = 'stage.finished';

type Matchup = Awaited<ReturnType<MatchesDrizzleRepository['getMatchupById']>>;

type RosterScoreData = Parameters<typeof matchScoreToChallongeScoreRequest>[0];

// Nothing more can be played on Challonge: every match is complete, or the ones left are waiting for
// players that will never come, such as the unneeded reset of a double-elimination grand final
function isChallongeBracketOver(matches: IChallongeMatch[]) {
  if (!matches.some((match) => match.attributes.state === 'complete')) {
    return false;
  }

  const players = (match: IChallongeMatch) =>
    [match.relationships?.player1, match.relationships?.player2].filter(
      (player) => player?.data?.id,
    ).length;

  return matches.every(
    (match) =>
      match.attributes.state === 'complete' ||
      (match.attributes.state === 'pending' && players(match) < 2),
  );
}

// The stage type whose bracket Challonge actually runs
function challongeBracketType(stageType?: string | null) {
  return stageType === stageTypeEnum.COMPASS ||
    stageType === stageTypeEnum.TRIPLE_ELIMINATION
    ? stageTypeEnum.DOUBLE_ELIMINATION
    : stageType;
}

// Used when a roster was never registered with Challonge
const FALLBACK_CHALLONGE_PARTICIPANT_ID = '1111';

@Injectable()
export class MatchesService {
  private readonly logger = new Logger(MatchesService.name);

  constructor(
    private readonly matchesRepository: MatchesDrizzleRepository,
    private readonly challongeService: ChallongeService,
    private readonly rosterService: RosterService,
    private readonly careerService: CareerService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createMatchScore(
    matchupId: number,
    createMatchResult: IEndMatchupRequest,
  ) {
    const matchup = await this.matchesRepository.getMatchupById(matchupId);

    const scores = await this.matchesRepository.insertMatchScore(
      matchupId,
      createMatchResult,
    );

    await this.updateRatings(matchupId, { revert: false, apply: true });

    await this.syncMatchupToChallonge(matchup, {
      action: 'update',
      advancesRound: true,
      buildScoreData: () => this.buildResultScoreData(createMatchResult),
    });

    await this.advanceLocalBracketAfter(matchup);

    return scores;
  }

  async deleteMatchScore(matchupId: number) {
    const matchup = await this.matchesRepository.getMatchupById(matchupId);

    await this.checkResultCanChange(matchup);

    const result = await this.matchesRepository.deleteMatchScore(matchupId);

    await this.updateRatings(matchupId, { revert: true, apply: false });

    await this.syncMatchupToChallonge(matchup, {
      action: 'reset',
      advancesRound: false,
      buildScoreData: () => this.buildResetScoreData(matchup),
    });

    return result;
  }

  async updateMatchScore(
    matchupId: number,
    createMatchResult: IEndMatchupRequest,
  ) {
    const matchup = await this.matchesRepository.getMatchupById(matchupId);

    await this.checkResultCanChange(matchup);

    const scores = await this.matchesRepository.updateMatchScore(
      matchupId,
      createMatchResult,
    );

    await this.updateRatings(matchupId, { revert: true, apply: true });

    await this.syncMatchupToChallonge(matchup, {
      action: 'update',
      advancesRound: true,
      buildScoreData: () => this.buildResultScoreData(createMatchResult),
    });

    await this.advanceLocalBracketAfter(matchup);

    return scores;
  }

  // A corrected result is re-rated from scratch: the old changes are undone, then the new result is applied.
  // Rating problems are logged and never undo the saved result.
  private async updateRatings(
    matchupId: number,
    { revert, apply }: { revert: boolean; apply: boolean },
  ) {
    try {
      if (revert) {
        await this.careerService.revertMatchResult(matchupId);
      }

      if (apply) {
        await this.careerService.applyMatchResult(matchupId);
      }
    } catch (error) {
      this.logger.error(
        `Failed to update ratings for matchup ${matchupId}`,
        error,
      );
    }
  }

  // Draws a stage that has no Challonge tournament, in the format its stage type names. Rosters are
  // seeded by seed, then rating. A round robin is drawn in full; other formats one round at a time.
  async startLocalBracket(stageId: number, startDate: Date) {
    const rosterIdsBySeed =
      await this.matchesRepository.getRostersBySeed(stageId);

    if (!rosterIdsBySeed.length) {
      throw new BadRequestException(
        `No rosters found for stage with ID ${stageId}`,
      );
    }

    const stage = await this.matchesRepository.getStageById(stageId);
    const format = bracketFormatFor(stage?.stageType);

    switch (format) {
      case LocalBracketFormat.ROUND_ROBIN: {
        const rounds = roundRobinRounds(rosterIdsBySeed);

        for (const [index, pairs] of rounds.entries()) {
          await this.matchesRepository.insertLocalRound(
            stageId,
            index + 1,
            pairs.map((rosterIds) => ({ rosterIds })),
            startDate,
          );
        }
        break;
      }
      case LocalBracketFormat.SWISS:
        await this.matchesRepository.insertLocalRound(
          stageId,
          1,
          swissFirstRound(rosterIdsBySeed),
          startDate,
        );
        break;
      case LocalBracketFormat.DOUBLE_ELIMINATION:
      case LocalBracketFormat.TRIPLE_ELIMINATION:
        await this.matchesRepository.insertLocalRound(
          stageId,
          1,
          doubleEliminationFirstRound(rosterIdsBySeed),
          startDate,
        );
        break;
      case LocalBracketFormat.COMPASS:
        await this.matchesRepository.insertLocalRound(
          stageId,
          1,
          compassFirstRound(rosterIdsBySeed),
          startDate,
        );
        break;
      default:
        await this.matchesRepository.insertLocalRound(
          stageId,
          1,
          firstRoundPairings(rosterIdsBySeed).map((rosterIds) => ({
            rosterIds,
          })),
          startDate,
        );
    }

    await this.advanceLocalBracket(stageId, 1);
  }

  // Once every matchup of a round has a result, draws the next round, or finishes the stage when the
  // format is done
  async advanceLocalBracket(stageId: number, round: number): Promise<void> {
    const stage = await this.matchesRepository.getStageById(stageId);
    const format = bracketFormatFor(stage?.stageType);
    const matchups = await this.matchesRepository.getLocalMatchups(stageId);
    const roundMatchups = matchups.filter((m) => m.round === round);

    if (stage?.stageStatus === stageStatusEnum.FINISHED) {
      return;
    }

    // A round robin is drawn in full and its rounds can be played in any order
    if (format === LocalBracketFormat.ROUND_ROBIN) {
      if (matchups.every((m) => m.isFinished)) {
        await this.finishLocalStage(stageId);
      }
      return;
    }

    if (!roundMatchups.length || roundMatchups.some((m) => !m.isFinished)) {
      return;
    }

    if (matchups.some((m) => m.round > round)) {
      return;
    }

    if (
      isElimination(format) &&
      roundMatchups.some((m) => m.winners.length !== 1)
    ) {
      this.logger.warn(
        `Round ${round} of stage ${stageId} has a matchup without a single winner; the bracket cannot advance`,
      );
      return;
    }

    const pairings = await this.nextLocalRound(
      stageId,
      format,
      round,
      matchups,
    );

    if (!pairings) {
      await this.finishLocalStage(stageId);
      return;
    }

    await this.matchesRepository.insertLocalRound(
      stageId,
      round + 1,
      pairings,
      new Date(),
    );

    await this.advanceLocalBracket(stageId, round + 1);
  }

  // The pairings of the round after `round`, or null when the stage is over
  private async nextLocalRound(
    stageId: number,
    format: LocalBracketFormat,
    round: number,
    matchups: LocalMatchup[],
  ): Promise<Pairing[] | null> {
    const rosterIdsBySeed =
      await this.matchesRepository.getRostersBySeed(stageId);

    switch (format) {
      case LocalBracketFormat.SWISS: {
        if (round >= swissRoundCount(rosterIdsBySeed.length)) {
          return null;
        }

        const standings = computeStandings(
          format,
          rosterIdsBySeed,
          matchups,
          await this.matchesRepository.getCarriedPoints(stageId),
        );

        return swissNextRound(
          standings.map((row) => row.rosterId),
          matchups,
        );
      }
      case LocalBracketFormat.DOUBLE_ELIMINATION: {
        const next = doubleEliminationNextRound(rosterIdsBySeed, matchups);

        return next.pairings.length ? next.pairings : null;
      }
      case LocalBracketFormat.TRIPLE_ELIMINATION: {
        const next = tripleEliminationNextRound(rosterIdsBySeed, matchups);

        return next.pairings.length ? next.pairings : null;
      }
      case LocalBracketFormat.COMPASS: {
        const next = compassNextRound(rosterIdsBySeed, matchups);

        return next.pairings.length ? next.pairings : null;
      }
      default: {
        const winners = matchups
          .filter((m) => m.round === round)
          .map((m) => m.winners[0]);

        return winners.length > 1
          ? nextRoundPairings(winners).map((rosterIds) => ({ rosterIds }))
          : null;
      }
    }
  }

  private async finishLocalStage(stageId: number) {
    await this.matchesRepository.finishStage(stageId);

    // Conversion rules apply here; their failures are logged and never undo the result
    try {
      await this.eventEmitter.emitAsync(STAGE_FINISHED_EVENT, { stageId });
    } catch (error) {
      this.logger.error(`Failed to handle the end of stage ${stageId}`, error);
    }
  }

  async getStandings(stageId: number): Promise<IStageStandingsResponse> {
    const stage = await this.matchesRepository.getStageById(stageId);

    if (!stage) {
      throw new NotFoundException(`Stage with ID ${stageId} not found`);
    }

    const [rosterIdsBySeed, matchups, carriedPoints, hasChallongeMatchups] =
      await Promise.all([
        this.matchesRepository.getRostersBySeed(stageId),
        this.matchesRepository.getLocalMatchups(stageId),
        this.matchesRepository.getCarriedPoints(stageId),
        this.matchesRepository.hasChallongeMatchups(stageId),
      ]);

    // A stage with a Challonge tournament runs on it once started there, or when it will be started
    // there; one started by the API (Challonge off) keeps its own bracket whatever it holds
    const runsOnChallonge =
      !!stage.challongeTournamentId &&
      (hasChallongeMatchups || (!matchups.length && isChallongeEnabled()));

    // Challonge runs compass and triple elimination as double elimination
    const format = bracketFormatFor(
      runsOnChallonge ? challongeBracketType(stage.stageType) : stage.stageType,
    );

    return {
      stageId,
      format,
      isFinished: stage.stageStatus === stageStatusEnum.FINISHED,
      runsOnChallonge,
      standings: computeStandings(
        format,
        rosterIdsBySeed,
        matchups,
        carriedPoints,
      ),
    };
  }

  private isLocalMatchup(matchup: Matchup) {
    return !matchup.matchup.challongeMatchupId && matchup.matchup.round != null;
  }

  private async advanceLocalBracketAfter(matchup: Matchup) {
    if (!this.isLocalMatchup(matchup)) {
      return;
    }

    await this.advanceLocalBracket(
      matchup.matchup.stageId,
      matchup.matchup.round,
    );
  }

  // In a local bracket later rounds are drawn from these results, so they are frozen once the next
  // round exists (round robin rounds do not depend on each other), and every result is frozen once
  // the stage is finished and its conversion rules have run
  private async checkResultCanChange(matchup: Matchup) {
    const stage = await this.matchesRepository.getStageById(
      matchup.matchup.stageId,
    );

    // Its conversion rules have run, whoever drew the bracket
    if (stage?.stageStatus === stageStatusEnum.FINISHED) {
      throw new BadRequestException(
        'The stage is finished, so its results can no longer change',
      );
    }

    if (!this.isLocalMatchup(matchup)) {
      return;
    }

    if (bracketFormatFor(stage?.stageType) === LocalBracketFormat.ROUND_ROBIN) {
      return;
    }

    const isNextRoundDrawn = await this.matchesRepository.hasRound(
      matchup.matchup.stageId,
      matchup.matchup.round + 1,
    );

    if (isNextRoundDrawn) {
      throw new BadRequestException(
        'The next round has already been drawn, so this result can no longer change',
      );
    }
  }

  // After a result on Challonge: bring in the next round once the current one is done, then finish
  // the stage if the bracket is over. One look at Challonge's matches serves both.
  private async followChallongeBracket(
    stage: NonNullable<
      Awaited<ReturnType<MatchesDrizzleRepository['getStageById']>>
    >,
    round: number,
  ) {
    const matches = await this.challongeService.getTournamentMatches(
      stage.challongeTournamentId.toString(),
    );

    try {
      await this.importNextRoundIfDone(stage.id, round, matches);
    } catch (error) {
      console.error(
        `Error checking round completion and updating next round:`,
        error,
      );
    }

    // Challonge decides when its bracket is over. The stage then finishes the same way a local one
    // does, so its conversion rules apply without anyone calling for them.
    if (
      stage.stageStatus !== stageStatusEnum.FINISHED &&
      isChallongeBracketOver(matches)
    ) {
      await this.finishLocalStage(stage.id);
    }
  }

  private async importNextRoundIfDone(
    stageId: number,
    round: number,
    challongeMatches: IChallongeMatch[],
  ) {
    const matchups = await this.matchesRepository.getMatchupsByRound(
      stageId,
      round,
    );

    if (!matchups.every((matchup) => matchup.isFinished)) {
      return;
    }

    const nextRound = round + 1;
    const nextRoundMatches = challongeMatches.filter(
      (match) =>
        match.attributes.round === nextRound &&
        match.attributes.state !== 'pending',
    );

    if (nextRoundMatches.length === 0) {
      console.log(`No matches found for round ${nextRound} in Challonge yet.`);
      return;
    }

    await this.importChallongeMatchesToStage(stageId, nextRoundMatches);
  }

  async deleteScore(id: number) {
    return this.matchesRepository.deleteScore(id);
  }

  async isMatchupInTournament(matchupId: number, tournamentId: number) {
    const result = await this.matchesRepository.isMatchupInTournament(
      matchupId,
      tournamentId,
    );
    return result.belongsToTournament;
  }

  async canUserEditMatchup(matchupId: number, userId: number) {
    const result = await this.matchesRepository.canUserEditMatchup(
      matchupId,
      userId,
    );

    return result;
  }

  async getMatchupById(matchupId: number) {
    return this.matchesRepository.getMatchupById(matchupId);
  }

  async getMatchupsWithResults(query: QueryMatchupRequestDto = {}) {
    const results = await this.matchesRepository.getWithResults(query);
    return mapMatchupsWithResults(results);
  }

  async getMatchupWithResultsAndScores(matchupId: number) {
    const rawResult = (await this.matchesRepository.getWithResultsAndScores(
      matchupId,
    )) as RawMatchupWithScores;

    return mapMatchupWithResultsAndScores(rawResult);
  }

  async getResultsForUser(userId: number, pagination?: PaginationOnly) {
    const results = await this.matchesRepository.getResultsForUser(
      userId,
      pagination,
    );

    return mapMatchupsWithResults(results);
  }

  async getResultsForRoster(rosterId: number, pagination?: PaginationOnly) {
    const results = await this.matchesRepository.getResultsForRoster(
      rosterId,
      pagination,
    );

    return mapMatchupsWithResults(results);
  }

  async getResultsForGroup(groupId: number, pagination?: PaginationOnly) {
    const results = await this.matchesRepository.getResultsForGroup(
      groupId,
      pagination,
    );

    return mapMatchupsWithResults(results);
  }

  async importChallongeMatchesToStage(
    stageId: number,
    challongeMatches: IChallongeMatch[],
  ) {
    return this.matchesRepository.importChallongeMatchesToStage(
      stageId,
      challongeMatches,
    );
  }

  async getManagedMatchups(userId: number, query: QueryMatchupRequestDto) {
    return this.matchesRepository.getManagedMatchups(userId, query);
  }

  // Challonge is a mirror of our own data, so a failed sync is logged and never fails the request
  private async syncMatchupToChallonge(
    matchup: Matchup,
    options: {
      action: 'update' | 'reset';
      advancesRound: boolean;
      buildScoreData: () => Promise<RosterScoreData>;
    },
  ) {
    const { challongeMatchupId, stageId, round } = matchup.matchup;

    if (!isChallongeEnabled() || !challongeMatchupId) {
      return;
    }

    try {
      const stage = await this.matchesRepository.getStageById(stageId);

      if (!stage?.challongeTournamentId) {
        return;
      }

      const rosterScoreData = await options.buildScoreData();

      await this.challongeService.updateMatchup(
        challongeMatchupId?.toString(),
        stage.challongeTournamentId?.toString(),
        matchScoreToChallongeScoreRequest(rosterScoreData),
      );

      if (options.advancesRound) {
        await this.followChallongeBracket(stage, round);
      }
    } catch (error) {
      console.error(
        `Failed to ${options.action} Challonge matchup ${challongeMatchupId}:`,
        error,
      );
    }
  }

  private async buildResultScoreData(
    matchResult: IEndMatchupRequest,
  ): Promise<RosterScoreData> {
    const rosters = await Promise.all(
      matchResult.results.map((result) =>
        this.rosterService.findOne<IMiniRosterResponse>(result.rosterId),
      ),
    );

    return matchResult.results.map((result, index) => ({
      rosterId: this.toChallongeParticipantId(rosters[index]),
      score: matchResult.scores
        .map(
          (score) =>
            score.scores.find((s) => s.rosterId === result.rosterId)?.points ||
            0,
        )
        .join(','),
      isWinner: result.isWinner,
    }));
  }

  private async buildResetScoreData(
    matchup: Matchup,
  ): Promise<RosterScoreData> {
    const rosters = await Promise.all(
      matchup.rosterToMatchup.map((rosterToMatchup) =>
        this.rosterService.findOne<IMiniRosterResponse>(
          rosterToMatchup.rosterId,
        ),
      ),
    );

    return rosters.map((roster) => ({
      rosterId: this.toChallongeParticipantId(roster),
      score: '0',
      isWinner: false,
    }));
  }

  private toChallongeParticipantId(roster: IMiniRosterResponse): number {
    return parseInt(
      roster.challongeParticipantId?.toString() ||
        FALLBACK_CHALLONGE_PARTICIPANT_ID,
    );
  }
}
