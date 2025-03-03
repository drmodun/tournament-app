import { Injectable } from '@nestjs/common';
import { EndMatchupRequestDto } from './dto/requests';
import { MatchesDrizzleRepository } from './matches.repository';

@Injectable()
export class MatchesService {
  constructor(private readonly matchesRepository: MatchesDrizzleRepository) {}

  async createScore(createScoreDto: EndMatchupRequestDto, matchupId: number) {
    await this.matchesRepository.insertMatchScore(matchupId, createScoreDto);
  }

  async deleteScore(scoreId: number) {
    await this.matchesRepository.deleteScore(scoreId);
  }

  async updateScore(matchupId: number, updateScoreDto: EndMatchupRequestDto) {
    await this.matchesRepository.updateMatchScore(matchupId, updateScoreDto);
  }

  async isMatchupInTournament(matchupId: number, tournamentId: number) {
    return this.matchesRepository.isMatchupInTournament(
      matchupId,
      tournamentId,
    );
  }

  async deleteMatchScore(matchupId: number) {
    return this.matchesRepository.deleteMatchScore(matchupId);
  }
}
