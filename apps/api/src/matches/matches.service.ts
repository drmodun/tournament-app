import { Injectable, NotFoundException } from '@nestjs/common';
import { EndMatchupRequestDto } from './dto/requests';
import { MatchesDrizzleRepository } from './matches.repository';
import {
  BracketDataResponseDto,
  BracketMatchDto,
  BracketParticipantDto,
} from './dto/responses';
import { ChallongeService } from '../challonge/challonge.service';
import {
  IChallongeMatch,
  matchScoreToChallongeScoreRequest,
} from '@tournament-app/types';
import {
  ReactBracketsResponseDto,
  ReactBracketsTeamDto,
} from './dto/responses';

@Injectable()
export class MatchesService {
  constructor(
    private readonly matchesRepository: MatchesDrizzleRepository,
    private readonly challongeService: ChallongeService,
  ) {}

  async createScore(createScoreDto: any) {
    return this.matchesRepository.createScore(createScoreDto);
  }

  async deleteScore(id: number) {
    return this.matchesRepository.deleteScore(id);
  }

  async updateScore(id: number, updateScoreDto: any) {
    return this.matchesRepository.updateScore(id, updateScoreDto);
  }

  async isMatchupInTournament(
    matchupId: number,
    tournamentId: number,
  ): Promise<boolean> {
    const result = await this.matchesRepository.isMatchupInTournament(
      matchupId,
      tournamentId,
    );
    return result.belongsToTournament;
  }

  async deleteMatchScore(matchupId: number) {
    const matchup = await this.matchesRepository.getMatchupById(matchupId);
    const result = await this.matchesRepository.deleteMatchScore(matchupId);

    // If the matchup has a Challonge ID, update it in Challonge
    if (matchup.challongeMatchupId) {
      await this.challongeService.updateMatchup(
        parseInt(matchup.challongeMatchupId),
        matchScoreToChallongeScoreRequest({
          rosterScores: matchup.rosterToMatchup.map((rm) => ({
            rosterId: rm.rosterId,
            score: '0',
            isWinner: false,
          })),
        }),
      );
    }

    return result;
  }

  async getMatchupById(matchupId: number) {
    return this.matchesRepository.getMatchupById(matchupId);
  }

  async createMatchScore(
    matchupId: number,
    createScoreDto: EndMatchupRequestDto,
  ) {
    const matchup = await this.matchesRepository.getMatchupById(matchupId);
    const result = await this.matchesRepository.insertMatchScore(
      matchupId,
      createScoreDto,
    );

    // If the matchup has a Challonge ID, update it in Challonge
    if (matchup.challongeMatchupId) {
      await this.challongeService.updateMatchup(
        parseInt(matchup.challongeMatchupId),
        matchScoreToChallongeScoreRequest({
          rosterScores: createScoreDto.results.map((result) => ({
            rosterId: result.rosterId,
            score: createScoreDto.scores
              .map(
                (score) =>
                  score.scores.find((s) => s.rosterId === result.rosterId)
                    ?.points || 0,
              )
              .join('-'),
            isWinner: result.isWinner,
          })),
        }),
      );
    }

    return result;
  }

  async updateMatchScore(
    matchupId: number,
    updateScoreDto: EndMatchupRequestDto,
  ) {
    const matchup = await this.matchesRepository.getMatchupById(matchupId);
    const result = await this.matchesRepository.updateMatchScore(
      matchupId,
      updateScoreDto,
    );

    // If the matchup has a Challonge ID, update it in Challonge
    if (matchup.challongeMatchupId) {
      await this.challongeService.updateMatchup(
        parseInt(matchup.challongeMatchupId),
        matchScoreToChallongeScoreRequest({
          rosterScores: updateScoreDto.results.map((result) => ({
            rosterId: result.rosterId,
            score: updateScoreDto.scores
              .map(
                (score) =>
                  score.scores.find((s) => s.rosterId === result.rosterId)
                    ?.points || 0,
              )
              .join('-'),
            isWinner: result.isWinner,
          })),
        }),
      );
    }

    return result;
  }

  /**
   * Get bracket data for a stage in the format required by @g-loot/react-tournament-brackets
   */
  async getBracketDataForStage(
    stageId: number,
  ): Promise<BracketDataResponseDto> {
    const stageData =
      await this.matchesRepository.getBracketDataForStage(stageId);

    if (!stageData || !stageData.stage) {
      throw new NotFoundException(`Stage with ID ${stageId} not found`);
    }

    // Transform the data into the format required by @g-loot/react-tournament-brackets
    const matches: BracketMatchDto[] = stageData.matchups.map((matchup) => {
      // Calculate the round text based on matchup round number
      const roundText = `Round ${matchup.roundNumber || 1}`;

      // Create participants array from roster matchups
      const participants: BracketParticipantDto[] = stageData.rosterMatchups
        .filter((roster) => roster.matchupId == matchup.id)
        .map((rosterMatchup) => {
          const roster = stageData.rosterDetails.find(
            (x) => x.id == rosterMatchup.rosterId,
          );

          // Find score details for this roster in this matchup
          const rosterScoreDetails = stageData.scoreDetails.filter(
            (detail) =>
              detail.scoreId &&
              stageData.scores.some(
                (s) => s.id === detail.scoreId && s.matchupId === matchup.id,
              ) &&
              detail.rosterId === roster.id,
          );

          // Calculate wins for this roster
          const wins = rosterScoreDetails.filter(
            (detail) => detail.isWinner,
          ).length;

          // Determine if this roster is the overall winner of the matchup
          const isWinner = rosterMatchup.isWinner || false;

          // Create a result text (e.g., "2-1" or just the number of wins)
          const resultText = wins.toString();

          return {
            id: roster.id,
            name: 'Team',
            isWinner,
            resultText,
            wins,
            // Optional fields
            logo: undefined,
            status: isWinner ? 'PLAYED' : undefined,
          };
        });

      // Determine match state
      let state: 'SCHEDULED' | 'ACTIVE' | 'DONE' = 'SCHEDULED';
      if (matchup.isFinished) {
        state = 'DONE';
      } else if (
        stageData.scores.some((score) => score.matchupId === matchup.id)
      ) {
        state = 'ACTIVE';
      }

      return {
        id: matchup.id.toString(),
        nextMatchId: matchup.parentMatchupId?.toString(),
        tournamentRoundText: roundText,
        startTime: matchup.startDate?.toISOString() || new Date().toISOString(),
        state,
        participants,
      };
    });

    return {
      stageId: stageData.stage.id,
      stageName: stageData.stage.name,
      stageType: stageData.stage.stageType,
      tournamentId: stageData.stage.tournamentId,
      matches,
    };
  }

  /**
   * Get bracket data for a stage in the original format (without Challonge data)
   */
  async getOriginalBracketDataForStage(
    stageId: number,
  ): Promise<BracketDataResponseDto> {
    const stageData =
      await this.matchesRepository.getBracketDataForStage(stageId);

    if (!stageData || !stageData.stage) {
      throw new NotFoundException(`Stage with ID ${stageId} not found`);
    }

    // Transform the data into the original format
    const matches: BracketMatchDto[] = stageData.matchups.map((matchup) => {
      // Calculate the round text based on matchup round number
      const roundText = `Round ${matchup.roundNumber || 1}`;

      // Create participants array from roster matchups
      const participants: BracketParticipantDto[] = stageData.rosterMatchups
        .filter((rosterMatchup) => rosterMatchup.matchupId === matchup.id)
        .map((rosterMatchup) => {
          const roster = stageData.rosterDetails.find(
            (r) => r.id === rosterMatchup.rosterId,
          );
          const participation = stageData.participationDetails.find(
            (p) => p.id === roster.participationId,
          );

          // Get participant name and logo
          let name = 'TBD';
          let logo: string | undefined;

          if (participation.groupId) {
            const group = stageData.groupDetails.find(
              (g) => g.id === participation.groupId,
            );
            if (group) {
              name = group.name;
              logo = group.logo;
            }
          } else if (participation.userId) {
            const user = stageData.userDetails.find(
              (u) => u.id === participation.userId,
            );
            if (user) {
              name = user.username;
              logo = user.profilePicture;
            }
          }

          // Find score details for this roster in this matchup
          const rosterScoreDetails = stageData.scoreDetails.filter(
            (detail) =>
              detail.scoreId &&
              stageData.scores.some(
                (s) => s.id === detail.scoreId && s.matchupId === matchup.id,
              ) &&
              detail.rosterId === roster.id,
          );

          // Calculate wins for this roster
          const wins = rosterScoreDetails.filter(
            (detail) => detail.isWinner,
          ).length;

          // Determine if this roster is the overall winner of the matchup
          const isWinner = rosterMatchup.isWinner || false;

          // Create a result text (e.g., "2-1" or just the number of wins)
          const resultText = wins > 0 ? wins.toString() : undefined;

          return {
            id: roster.id,
            name,
            logo,
            isWinner,
            resultText,
            wins,
            status: isWinner ? 'PLAYED' : undefined,
          };
        });

      // Determine match state
      let state: 'SCHEDULED' | 'ACTIVE' | 'DONE' = 'SCHEDULED';
      if (matchup.isFinished) {
        state = 'DONE';
      } else if (
        stageData.scores.some((score) => score.matchupId === matchup.id)
      ) {
        state = 'ACTIVE';
      }

      return {
        id: matchup.id.toString(),
        nextMatchId: matchup.parentMatchupId?.toString(),
        tournamentRoundText: roundText,
        startTime: matchup.startDate?.toISOString() || new Date().toISOString(),
        state,
        participants,
      };
    });

    return {
      stageId: stageData.stage.id,
      stageName: stageData.stage.name,
      stageType: stageData.stage.stageType,
      tournamentId: stageData.stage.tournamentId,
      matches,
    };
  }

  /**
   * Get bracket data for a stage in the format required by react-brackets
   */
  async getReactBracketDataForStage(
    stageId: number,
  ): Promise<ReactBracketsResponseDto> {
    const stageData =
      await this.matchesRepository.getBracketDataForStage(stageId);

    if (!stageData || !stageData.stage) {
      throw new NotFoundException(`Stage with ID ${stageId} not found`);
    }

    // Group matchups by round
    const matchupsByRound = stageData.matchups.reduce(
      (acc, matchup) => {
        const roundNumber = matchup.roundNumber || 1;
        if (!acc[roundNumber]) {
          acc[roundNumber] = [];
        }
        acc[roundNumber].push(matchup);
        return acc;
      },
      {} as Record<number, typeof stageData.matchups>,
    );

    // Transform data into react-brackets format
    const rounds = Object.entries(matchupsByRound).map(
      ([roundNumber, matchups]) => {
        return {
          title: `Round ${roundNumber}`,
          seeds: matchups.map((matchup) => {
            // Get participants for this matchup
            const participants = stageData.rosterMatchups
              .filter((rm) => rm.matchupId === matchup.id)
              .map((rm) => {
                const roster = stageData.rosterDetails.find(
                  (r) => r.id === rm.rosterId,
                );
                const participation = stageData.participationDetails.find(
                  (p) => p.id === roster.participationId,
                );

                // Get participant name
                let name = 'TBD';
                if (participation.groupId) {
                  const group = stageData.groupDetails.find(
                    (g) => g.id === participation.groupId,
                  );
                  if (group) name = group.name;
                } else if (participation.userId) {
                  const user = stageData.userDetails.find(
                    (u) => u.id === participation.userId,
                  );
                  if (user) name = user.username;
                }

                // Calculate score for this roster
                const rosterScores = stageData.scoreDetails
                  .filter((sd) => sd.rosterId === rm.rosterId)
                  .filter((sd) =>
                    stageData.scores.some(
                      (s) => s.id === sd.scoreId && s.matchupId === matchup.id,
                    ),
                  );

                const wins = rosterScores.filter((s) => s.isWinner).length;
                const score = wins > 0 ? wins.toString() : undefined;

                return {
                  id: roster.id,
                  name,
                  score,
                };
              });

            // Ensure we always have two teams (even if TBD)
            const teams: [ReactBracketsTeamDto, ReactBracketsTeamDto] = [
              participants[0] || { name: 'TBD' },
              participants[1] || { name: 'TBD' },
            ];

            // Find winner if match is finished
            let winner: number | undefined;
            if (matchup.isFinished) {
              const winningRoster = stageData.rosterMatchups.find(
                (rm) => rm.matchupId === matchup.id && rm.isWinner,
              );
              if (winningRoster) {
                winner = winningRoster.rosterId;
              }
            }

            // Calculate overall match score
            const score = matchup.isFinished
              ? `${teams[0].score}-${teams[1].score}`
              : undefined;

            return {
              id: matchup.id,
              date:
                matchup.startDate?.toISOString() || new Date().toISOString(),
              teams,
              winner,
              score,
            };
          }),
        };
      },
    );

    return {
      stageId: stageData.stage.id,
      stageName: stageData.stage.name,
      rounds: rounds.sort(
        (a, b) =>
          parseInt(a.title.split(' ')[1]) - parseInt(b.title.split(' ')[1]),
      ),
    };
  }

  async getChallongeBracketData(
    stageId: number,
  ): Promise<ReactBracketsResponseDto> {
    const stage = await this.matchesRepository.getStageById(stageId);
    if (!stage || !stage.challongeTournamentId) {
      throw new NotFoundException(
        `Stage with ID ${stageId} not found or has no Challonge tournament`,
      );
    }

    return this.challongeService.getChallongeBracketData(
      stage.challongeTournamentId,
    );
  }

  async importChallongeMatchesToStage(
    stageId: number,
    matches: IChallongeMatch[],
  ) {
    return await this.matchesRepository.importChallongeMatchesToStage(
      stageId,
      matches,
    );
  }
}
