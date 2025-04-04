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


          await this.challongeService.updateMatchup(
            matchup.matchup.challongeMatchupId?.toString(),
            stage.challongeTournamentId?.toString(),
            matchScoreToChallongeScoreRequest(rosterScoreData),
          );

          await this.checkRoundCompletionAndUpdateNextRound(
            matchup.matchup.stageId,
            matchup.matchup.round,
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

          // Check if round is complete and update next round
          await this.checkRoundCompletionAndUpdateNextRound(
            matchup.matchup.stageId,
            matchup.matchup.round,
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

  async checkRoundCompletionAndUpdateNextRound(
    stageId: number,
    round: number,
  ): Promise<void> {
    try {
      const matchups = await this.matchesRepository.getMatchupsByRound(
        stageId,
        round,
      );

      const allMatchupsFinished = matchups.every(
        (matchup) => matchup.isFinished,
      );

      if (allMatchupsFinished) {
        console.log(
          `All matchups in round ${round} for stage ${stageId} are complete. Updating next round...`,
        );

        const stage = await this.matchesRepository.getStageById(stageId);

        if (stage && stage.challongeTournamentId) {
          const challongeMatches = await this.challongeService.getMatches(
            stage.challongeTournamentId.toString(),
          );

          const nextRoundMatches = challongeMatches.filter(
            (match) =>
              match.attributes.round === round + 1 &&
              match.attributes.state !== 'pending',
          );

          if (nextRoundMatches.length > 0) {
            console.log(
              `Found ${nextRoundMatches.length} matches in next round from Challonge. Updating local database...`,
            );

            await this.importChallongeMatchesToStage(stageId, nextRoundMatches);

            console.log(`Successfully updated matches for round ${round + 1}`);
          } else {
            console.log(
              `No matches found for round ${round + 1} in Challonge yet.`,
            );
          }
        }
      }
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
    return this.mapRepositoryResultsToDto(results);
  }

  async getMatchupWithResultsAndScores(matchupId: number) {
    type MatchupResult = {
      id: number;
      stageId: number;
      round: number;
      isFinished: boolean;
      challongeMatchupId?: string;
      score?: Array<{
        id: number;
        roundNumber: number;
        matchupId: number;
        isWinner?: boolean;
        scoreToRoster?: Array<{
          id: number;
          scoreId: number;
          rosterId: number;
          points: number;
          isWinner: boolean;
        }>;
      }>;
      rosterToMatchup?: Array<{
        isWinner: boolean;
        matchupId: number;
        score: number;
        roster?: any;
      }>;
    };

    const rawResult = (await this.matchesRepository.getWithResultsAndScores(
      matchupId,
    )) as MatchupResult;

    if (!rawResult) {
      return null;
    }

    const scoresMap = new Map<number, any[]>();

    if (rawResult.score && Array.isArray(rawResult.score)) {
      rawResult.score.forEach((scoreEntry) => {
        const roundNumber = scoreEntry.roundNumber;

        if (!scoresMap.has(roundNumber)) {
          scoresMap.set(roundNumber, []);
        }

        if (
          scoreEntry.scoreToRoster &&
          Array.isArray(scoreEntry.scoreToRoster)
        ) {
          scoreEntry.scoreToRoster.forEach((scoreToRoster) => {
            scoresMap.get(roundNumber).push({
              matchupId: scoreEntry.matchupId,
              roundNumber: scoreEntry.roundNumber,
              points: scoreToRoster.points,
              isWinner: scoreToRoster.isWinner,
              rosterId: scoreToRoster.rosterId,
            });
          });
        }
      });
    }

    const results = Array.isArray(rawResult.rosterToMatchup)
      ? rawResult.rosterToMatchup.map((rtm) => {
          const result = {
            id: rtm.roster?.id || 0,
            matchupId: rtm.matchupId,
            score: rtm.score,
            isWinner: rtm.isWinner,
            roster: rtm.roster || null,
          };

          const rosterScores = [];
          scoresMap.forEach((roundScores, roundNumber) => {
            const rosterScore = roundScores.find(
              (score) => score.rosterId === rtm.roster?.id,
            );
            if (rosterScore) {
              rosterScores.push({
                matchupId: rawResult.id,
                roundNumber,
                points: rosterScore.points,
                isWinner: rosterScore.isWinner,
              });
            }
          });

          return {
            ...result,
            scores: rosterScores,
          };
        })
      : [];

    return {
      id: rawResult.id,
      stageId: rawResult.stageId,
      round: rawResult.round,
      matchupType: 'standard',
      startDate: new Date(),
      isFinished: rawResult.isFinished,
      results: results,
    };
  }

  async getResultsForUser(userId: number, pagination?: PaginationOnly) {
    const results = await this.matchesRepository.getResultsForUser(
      userId,
      pagination,
    );

    return this.mapRepositoryResultsToDto(results);
  }

  async getResultsForRoster(rosterId: number, pagination?: PaginationOnly) {
    const results = await this.matchesRepository.getResultsForRoster(
      rosterId,
      pagination,
    );

    return this.mapRepositoryResultsToDto(results);
  }

  async getResultsForGroup(groupId: number, pagination?: PaginationOnly) {
    const results = await this.matchesRepository.getResultsForGroup(
      groupId,
      pagination,
    );

    return this.mapRepositoryResultsToDto(results);
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

  private mapRepositoryResultsToDto(repositoryResults: any[] | null): any[] {
    if (!repositoryResults || !Array.isArray(repositoryResults)) {
      return [];
    }

    return repositoryResults
      .map((rawMatch) => {
        if (!rawMatch) {
          return null;
        }

        const matchupBase = {
          id: rawMatch.id || 0,
          stageId: rawMatch.stageId || 0,
          round: rawMatch.round || 0,
          matchupType: rawMatch.matchupType || 'standard',
          startDate: rawMatch.startDate || new Date(),
          isFinished: !!rawMatch.isFinished,
        };

        const results = Array.isArray(rawMatch.rosterToMatchup)
          ? rawMatch.rosterToMatchup.map((rtm) => ({
              id: rtm?.roster?.id || 0,
              matchupId: rtm?.matchupId || rawMatch.id || 0,
              score: rtm?.score || 0,
              isWinner: !!rtm?.isWinner,
              roster: rtm?.roster || null,
            }))
          : [];

        return {
          ...matchupBase,
          results,
        };
      })
      .filter(Boolean);
  }
}
