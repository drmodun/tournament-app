import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { MatchesDrizzleRepository } from './matches.repository';
import { ChallongeService } from '../challonge/challonge.service';
import {
  IChallongeMatch,
  matchScoreToChallongeScoreRequest,
  IEndMatchupRequest,
  IMiniRosterResponse,
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

type Matchup = Awaited<ReturnType<MatchesDrizzleRepository['getMatchupById']>>;

type RosterScoreData = Parameters<typeof matchScoreToChallongeScoreRequest>[0];

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

  // Draws round 1 of a stage that has no Challonge tournament, seeding rosters by rating
  async startLocalBracket(stageId: number, startDate: Date) {
    const rosterIdsBySeed =
      await this.matchesRepository.getRostersBySeed(stageId);

    if (!rosterIdsBySeed.length) {
      throw new BadRequestException(
        `No rosters found for stage with ID ${stageId}`,
      );
    }

    await this.matchesRepository.insertLocalRound(
      stageId,
      1,
      firstRoundPairings(rosterIdsBySeed),
      startDate,
    );

    await this.advanceLocalBracket(stageId, 1);
  }

  // Once every matchup of a round has a winner, draws the next round, or finishes the stage after the final
  async advanceLocalBracket(stageId: number, round: number): Promise<void> {
    const matchups = await this.matchesRepository.getRoundWinners(
      stageId,
      round,
    );

    if (!matchups.length || matchups.some((m) => !m.isFinished)) {
      return;
    }

    if (await this.matchesRepository.hasRound(stageId, round + 1)) {
      return;
    }

    // Single elimination needs exactly one winner per matchup
    if (matchups.some((m) => m.winners.length !== 1)) {
      this.logger.warn(
        `Round ${round} of stage ${stageId} has a matchup without a single winner; the bracket cannot advance`,
      );
      return;
    }

    const winners = matchups.map((m) => m.winners[0]);

    if (winners.length === 1) {
      await this.matchesRepository.finishStage(stageId);
      return;
    }

    await this.matchesRepository.insertLocalRound(
      stageId,
      round + 1,
      nextRoundPairings(winners),
      new Date(),
    );

    await this.advanceLocalBracket(stageId, round + 1);
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

  // In a local bracket the next round is drawn from these results, so they are frozen once it exists
  private async checkResultCanChange(matchup: Matchup) {
    if (!this.isLocalMatchup(matchup)) {
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

  async checkRoundCompletionAndUpdateNextRound(
    stageId: number,
    round: number,
  ): Promise<void> {
    try {
      const matchups = await this.matchesRepository.getMatchupsByRound(
        stageId,
        round,
      );

      if (!matchups.every((matchup) => matchup.isFinished)) {
        return;
      }

      console.log(
        `All matchups in round ${round} for stage ${stageId} are complete. Updating next round...`,
      );

      const stage = await this.matchesRepository.getStageById(stageId);

      if (!stage?.challongeTournamentId) {
        return;
      }

      await this.importNextRoundFromChallonge(
        stageId,
        stage.challongeTournamentId.toString(),
        round + 1,
      );
    } catch (error) {
      console.error(
        `Error checking round completion and updating next round:`,
        error,
      );
    }
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

    if (!challongeMatchupId) {
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
        await this.checkRoundCompletionAndUpdateNextRound(stageId, round);
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

  private async importNextRoundFromChallonge(
    stageId: number,
    challongeTournamentId: string,
    nextRound: number,
  ) {
    const challongeMatches = await this.challongeService.getMatchesFiltered(
      challongeTournamentId,
      nextRound,
    );

    const nextRoundMatches = challongeMatches.filter(
      (match) =>
        match.attributes.round === nextRound &&
        match.attributes.state !== 'pending',
    );

    if (nextRoundMatches.length === 0) {
      console.log(`No matches found for round ${nextRound} in Challonge yet.`);
      return;
    }

    console.log(
      `Found ${nextRoundMatches.length} matches in next round from Challonge. Updating local database...`,
    );

    await this.importChallongeMatchesToStage(stageId, nextRoundMatches);

    console.log(`Successfully updated matches for round ${nextRound}`);
  }
}
