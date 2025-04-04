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

    if (matchup.matchup.challongeMatchupId) {
      try {
        const stage = await this.matchesRepository.getStageById(
          matchup.matchup.stageId,
        );

        if (stage && stage.challongeTournamentId) {
          const rosterPromises = createMatchResult.results.map((result) =>
            this.rosterService.findOne<IMiniRosterResponse>(result.rosterId),
          );

          const rosters = await Promise.all(rosterPromises);

          const rosterScoreData = createMatchResult.results.map(
            (result, index) => {
              return {
                rosterId: parseInt(
                  rosters[index].challongeParticipantId?.toString() || '1111',
                ),
                score: createMatchResult.scores
                  .map(
                    (score) =>
                      score.scores.find((s) => s.rosterId === result.rosterId)
                        ?.points || 0,
                  )
                  .join(','),
                isWinner: result.isWinner,
              };
            },
          );

          console.log(rosterScoreData, rosterPromises);

          await this.challongeService.updateMatchup(
            matchup.matchup.challongeMatchupId?.toString(),
            stage.challongeTournamentId?.toString(),
            matchScoreToChallongeScoreRequest(rosterScoreData),
          );
        }
      } catch (error) {
        console.error(
          `Failed to update Challonge matchup ${matchup.matchup.challongeMatchupId}:`,
          error,
        );
      }
    }

    return scores;
  }

  async deleteMatchScore(matchupId: number) {
    const matchup = await this.matchesRepository.getMatchupById(matchupId);

    const result = await this.matchesRepository.deleteMatchScore(matchupId);

    if (matchup.matchup.challongeMatchupId) {
      try {
        const stage = await this.matchesRepository.getStageById(
          matchup.matchup.stageId,
        );

        if (stage && stage.challongeTournamentId) {
          const rosterPromises = matchup.rosterToMatchup.map((rm) =>
            this.rosterService.findOne(rm.rosterId),
          );

          const rosters = await Promise.all(rosterPromises);

          const rosterScoreData = rosters.map((roster) => ({
            rosterId: parseInt(
              roster.challongeParticipantId?.toString() || '1111',
            ),
            score: '0',
            isWinner: false,
          }));

          await this.challongeService.updateMatchup(
            matchup.matchup.challongeMatchupId?.toString(),
            stage.challongeTournamentId?.toString(),
            matchScoreToChallongeScoreRequest(rosterScoreData),
          );
        }
      } catch (error) {
        console.error(
          `Failed to reset Challonge matchup ${matchup.matchup.challongeMatchupId}:`,
          error,
        );
      }
    }

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

    if (matchup.matchup.challongeMatchupId) {
      try {
        const stage = await this.matchesRepository.getStageById(
          matchup.matchup.stageId,
        );

        if (stage && stage.challongeTournamentId) {
          const rosterPromises = createMatchResult.results.map((result) =>
            this.rosterService.findOne(result.rosterId),
          );

          const rosters = await Promise.all(rosterPromises);

          const rosterScoreData = createMatchResult.results.map(
            (result, index) => {
              return {
                rosterId: parseInt(
                  rosters[index].challongeParticipantId?.toString() || '1111',
                ),
                score: createMatchResult.scores
                  .map(
                    (score) =>
                      score.scores.find((s) => s.rosterId === result.rosterId)
                        ?.points || 0,
                  )
                  .join(','),
                isWinner: result.isWinner,
              };
            },
          );

          await this.challongeService.updateMatchup(
            matchup.matchup.challongeMatchupId?.toString(),
            stage.challongeTournamentId?.toString(),
            matchScoreToChallongeScoreRequest(rosterScoreData),
          );
        }
      } catch (error) {
        console.error(
          `Failed to update Challonge matchup ${matchup.matchup.challongeMatchupId}:`,
          error,
        );
      }
    }

    return scores;
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
    return this.matchesRepository.getWithResults(query);
  }

  async getMatchupWithResultsAndScores(matchupId: number) {
    return this.matchesRepository.getWithResultsAndScores(matchupId);
  }

  async getResultsForUser(userId: number) {
    return this.matchesRepository.getResultsForUser(userId);
  }

  async getResultsForRoster(rosterId: number) {
    return this.matchesRepository.getResultsForRoster(rosterId);
  }

  async getResultsForGroup(groupId: number) {
    const ids = await this.matchesRepository.getResultsForGroupIds(groupId);
    return this.matchesRepository.getWithResults({
      ids: ids.map((id) => id.id),
    });
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

  async getManagedMatchups(userId: number, query: PaginationOnly) {
    return this.matchesRepository.getManagedMatchups(userId, query);
  }
}
