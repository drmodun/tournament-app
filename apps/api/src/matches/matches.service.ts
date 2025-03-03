import { Injectable, NotFoundException } from '@nestjs/common';
import { EndMatchupRequestDto } from './dto/requests';
import { MatchesDrizzleRepository } from './matches.repository';
import {
  BracketDataResponseDto,
  BracketMatchDto,
  BracketParticipantDto,
} from './dto/responses';
import { db } from 'src/db/db';
import { rosterToMatchup } from 'src/db/schema';

@Injectable()
export class MatchesService {
  constructor(private readonly matchesRepository: MatchesDrizzleRepository) {}

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
    return this.matchesRepository.deleteMatchScore(matchupId);
  }

  async getMatchupById(matchupId: number) {
    return this.matchesRepository.getMatchupById(matchupId);
  }

  async createMatchScore(
    matchupId: number,
    createScoreDto: EndMatchupRequestDto,
  ) {
    return this.matchesRepository.insertMatchScore(matchupId, createScoreDto);
  }

  async updateMatchScore(
    matchupId: number,
    updateScoreDto: EndMatchupRequestDto,
  ) {
    return this.matchesRepository.updateMatchScore(matchupId, updateScoreDto);
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
}
