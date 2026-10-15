import { Injectable } from '@nestjs/common';
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
import {
  mapMatchupsWithResults,
  mapMatchupWithResultsAndScores,
  RawMatchupWithScores,
} from './matches.mappers';

type Matchup = Awaited<ReturnType<MatchesDrizzleRepository['getMatchupById']>>;

type RosterScoreData = Parameters<typeof matchScoreToChallongeScoreRequest>[0];

// Used when a roster was never registered with Challonge
const FALLBACK_CHALLONGE_PARTICIPANT_ID = '1111';

@Injectable()
export class MatchesService {
  constructor(
    private readonly matchesRepository: MatchesDrizzleRepository,
    private readonly challongeService: ChallongeService,
    private readonly rosterService: RosterService,
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

    await this.syncMatchupToChallonge(matchup, {
      action: 'update',
      advancesRound: true,
      buildScoreData: () => this.buildResultScoreData(createMatchResult),
    });

    return scores;
  }

  async deleteMatchScore(matchupId: number) {
    const matchup = await this.matchesRepository.getMatchupById(matchupId);

    const result = await this.matchesRepository.deleteMatchScore(matchupId);

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

    const scores = await this.matchesRepository.updateMatchScore(
      matchupId,
      createMatchResult,
    );

    await this.syncMatchupToChallonge(matchup, {
      action: 'update',
      advancesRound: true,
      buildScoreData: () => this.buildResultScoreData(createMatchResult),
    });

    return scores;
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
