import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import {
  IChallongeTournament,
  IChallongeParticipant,
  IChallongeMatch,
  ICreateChallongeTournamentRequest,
  ICreateChallongeParticipantRequest,
  IUpdateParticipantRequest,
  IMatchScoreRequest,
  stageToCreateTournamentRequest,
  IBulkCreateChallongeParticipantRequest,
  IUpdateChallongeTournamentRequest,
  ITournamentStateRequest,
  stageStatusToTournamentStateRequest,
  stageStatusEnum,
  IStageResponse,
} from '@tournament-app/types';
import { ReactBracketsResponseDto } from '../matches/dto/responses';

@Injectable()
export class ChallongeService {
  private readonly logger = new Logger(ChallongeService.name);
  private token: string;

  constructor(private readonly httpService: HttpService) {
    this.getChallongeToken();

    this.logger.log('ChallongeService constructor');
  }

  async getChallongeToken() {
    try {
      const params = new URLSearchParams();
      params.append('grant_type', 'client_credentials');
      params.append('client_id', process.env.CHALLONGE_CLIENT_ID || '');
      params.append('client_secret', process.env.CHALLONGE_CLIENT_SECRET || '');

      const response: AxiosResponse<{ access_token: string }> =
        await this.httpService.axiosRef.post(
          'https://api.challonge.com/oauth/token',
          params,
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        );

      this.token = response.data.access_token;
      console.log('this.token', this.token);
      this.logger.log('Successfully retrieved Challonge token');
    } catch (error) {
      this.logger.error('Failed to get Challonge token:', error);
    }
  }

  async createTournamentFunction(
    createTournamentDto: ICreateChallongeTournamentRequest,
  ) {
    try {
      const response: AxiosResponse<{ data: IChallongeTournament }> =
        await this.httpService.axiosRef.post(
          'https://api.challonge.com/v2/application/tournaments.json',
          createTournamentDto,
          this.injectHeaders(),
        );

      return response.data.data;
    } catch (error) {
      this.logger.error('Failed to create tournament:', error);
      throw error;
    }
  }

  async executeFunctionWithRetry(fn: () => Promise<any>) {
    try {
      return await fn();
    } catch (error) {
      this.logger.error(error);
      return this.refetcTokenAndRetryFunction(fn);
    }
  }

  async refetcTokenAndRetryFunction(fn: () => Promise<any>) {
    await this.getChallongeToken();
    return fn();
  }

  async createTournament(
    createTournamentDto: ICreateChallongeTournamentRequest,
  ): Promise<IChallongeTournament> {
    return await this.executeFunctionWithRetry(() =>
      this.createTournamentFunction(createTournamentDto),
    );
  }

  async updateTournamentFunction(
    id: string,
    updateTournamentDto: IUpdateChallongeTournamentRequest,
  ) {
    const response: AxiosResponse<IChallongeTournament> =
      await this.httpService.axiosRef.put(
        `https://api.challonge.com/v2/application/tournaments/${id}.json`,
        updateTournamentDto,
        this.injectHeaders(),
      );

    return response.data;
  }

  async updateTournament(
    id: string,
    updateTournamentDto: IUpdateChallongeTournamentRequest,
  ) {
    return this.executeFunctionWithRetry(() =>
      this.updateTournamentFunction(id, updateTournamentDto),
    );
  }

  injectHeaders() {
    return {
      headers: {
        'Authorization-Type': 'v2',
        'Content-Type': 'application/vnd.api+json',
        Accept: 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
    };
  }
  async createParticipantFunction(
    createParticipantDto: ICreateChallongeParticipantRequest,
  ) {
    const response: AxiosResponse<{ data: IChallongeParticipant }> =
      await this.httpService.axiosRef.post(
        'https://api.challonge.com/v2/application/participants.json',
        createParticipantDto,
        this.injectHeaders(),
      );

    return response.data.data;
  }

  async createParticipant(
    createParticipantDto: ICreateChallongeParticipantRequest,
  ): Promise<IChallongeParticipant> {
    return this.executeFunctionWithRetry(() =>
      this.createParticipantFunction(createParticipantDto),
    );
  }

  async updateParticipantFunction(
    id: number,
    updateParticipantDto: IUpdateParticipantRequest,
  ): Promise<IChallongeParticipant> {
    const response: AxiosResponse<IChallongeParticipant> =
      await this.httpService.axiosRef.put(
        `https://api.challonge.com/v2/application/participants/${id}.json`,
        updateParticipantDto,
        this.injectHeaders(),
      );

    return response.data;
  }

  async updateParticipant(
    id: number,
    updateParticipantDto: IUpdateParticipantRequest,
  ): Promise<IChallongeParticipant> {
    return this.executeFunctionWithRetry(() =>
      this.updateParticipantFunction(id, updateParticipantDto),
    );
  }

  async updateMatchupFunction(
    id: string,
    tournamentId: string,
    updateMatchupDto: IMatchScoreRequest,
  ): Promise<IChallongeMatch> {
    const response: AxiosResponse<{ data: IChallongeMatch }> =
      await this.httpService.axiosRef.put(
        `https://api.challonge.com/v2/application/tournaments/${tournamentId}/matches/${id}.json`,
        updateMatchupDto,
        this.injectHeaders(),
      );

    return response.data.data;
  }

  async updateMatchup(
    id: string,
    tournamentId: string,
    updateMatchupDto: IMatchScoreRequest,
  ): Promise<IChallongeMatch> {
    return this.executeFunctionWithRetry(() =>
      this.updateMatchupFunction(id, tournamentId, updateMatchupDto),
    );
  }

  async deleteTournamentFunction(id: string) {
    await this.httpService.axiosRef.delete(
      `https://api.challonge.com/v2/application/tournaments/${id}.json`,
      this.injectHeaders(),
    );
  }

  async deleteTournament(id: string) {
    return this.executeFunctionWithRetry(() =>
      this.deleteTournamentFunction(id),
    );
  }

  async deleteParticipant(id: string) {
    return this.executeFunctionWithRetry(() =>
      this.deleteParticipantFunction(id),
    );
  }

  async deleteParticipantFunction(id: string) {
    await this.httpService.axiosRef.delete(
      `https://api.challonge.com/v2/application/participants/${id}.json`,
      this.injectHeaders(),
    );
  }

  async createChallongeTournamentFromStage(stage: IStageResponse) {
    return await this.createTournament(stageToCreateTournamentRequest(stage));
  }

  async createBulkParticipants(
    tournamentId: string,
    participants: IBulkCreateChallongeParticipantRequest,
  ) {
    return this.executeFunctionWithRetry(() =>
      this.createBulkParticipantsFunction(tournamentId, participants),
    );
  }

  async createBulkParticipantsFunction(
    tournamentId: string,
    participants: IBulkCreateChallongeParticipantRequest,
  ): Promise<IChallongeParticipant[]> {
    try {
      const response: AxiosResponse<{ data: IChallongeParticipant[] }> =
        await this.httpService.axiosRef.post(
          `https://api.challonge.com/v2/application/tournaments/${tournamentId}/participants/bulk_add.json`,
          participants,
          this.injectHeaders(),
        );

      return response.data.data;
    } catch (error) {
      this.logger.error(
        'Failed to create bulk participants:',
        error.toString(),
        participants,
      );
      throw error;
    }
  }

  async getTournamentFunction(id: string): Promise<IChallongeTournament> {
    const response: AxiosResponse<IChallongeTournament> =
      await this.httpService.axiosRef.get(
        `https://api.challonge.com/v2/application/tournaments/${id}.json`,
        this.injectHeaders(),
      );
    return response.data;
  }

  async getTournament(id: string): Promise<IChallongeTournament> {
    return this.executeFunctionWithRetry(() => this.getTournamentFunction(id));
  }

  async getTournamentParticipantsFunction(
    id: string,
  ): Promise<IChallongeParticipant[]> {
    const response: AxiosResponse<IChallongeParticipant[]> =
      await this.httpService.axiosRef.get(
        `https://api.challonge.com/v2/application/tournaments/${id}/participants.json`,
        this.injectHeaders(),
      );
    return response.data;
  }

  async getTournamentParticipants(
    id: string,
  ): Promise<IChallongeParticipant[]> {
    return this.executeFunctionWithRetry(() =>
      this.getTournamentParticipantsFunction(id),
    );
  }

  async getTournamentMatchesFunction(id: string): Promise<IChallongeMatch[]> {
    const response: AxiosResponse<{ data: IChallongeMatch[] }> =
      await this.httpService.axiosRef.get(
        `https://api.challonge.com/v2/application/tournaments/${id}/matches.json`,
        this.injectHeaders(),
      );

    return response.data?.data;
  }

  async getTournamentMatches(id: string): Promise<IChallongeMatch[]> {
    return this.executeFunctionWithRetry(() =>
      this.getTournamentMatchesFunction(id),
    );
  }

  async getChallongeBracketData(
    tournamentId: string,
  ): Promise<ReactBracketsResponseDto> {
    const [tournament, participants, matches] = await Promise.all([
      this.getTournament(tournamentId),
      this.getTournamentParticipants(tournamentId),
      this.getTournamentMatches(tournamentId),
    ]);

    // Create a map of Challonge participant IDs to roster IDs
    const participantToRosterMap = new Map<string, number>();
    for (const participant of participants) {
      const misc = participant.attributes.misc
        ? JSON.parse(participant.attributes.misc)
        : null;
      if (misc?.rosterId) {
        participantToRosterMap.set(participant.id, misc.rosterId);
      }
    }

    // Group matches by round
    const matchesByRound = matches.reduce(
      (acc, match) => {
        const round = match.attributes.round;
        if (!acc[round]) {
          acc[round] = [];
        }
        acc[round].push(match);
        return acc;
      },
      {} as Record<number, IChallongeMatch[]>,
    );

    // Format data similar to our internal structure
    return {
      stageId: parseInt(tournament.id),
      stageName: tournament.attributes.name,
      rounds: Object.entries(matchesByRound)
        .sort(([a], [b]) => parseInt(a) - parseInt(b))
        .map(([roundNumber, roundMatches]) => ({
          title: `Round ${roundNumber}`,
          seeds: roundMatches.map((match) => ({
            id: match.id,
            date:
              match.attributes.timestamps.starts_at || new Date().toISOString(),
            teams: [
              {
                id: participantToRosterMap.get(
                  match.relationships.player1.data.id,
                ),
                name: `Roster-${participantToRosterMap.get(match.relationships.player1.data.id)}`,
              },
              {
                id: participantToRosterMap.get(
                  match.relationships.player2.data.id,
                ),
                name: `Roster-${participantToRosterMap.get(match.relationships.player2.data.id)}`,
              },
            ],
            winner: match.winnerId
              ? participantToRosterMap.get(match.winnerId.toString())
              : undefined,
          })),
        })),
    };
  }

  async updateTournamentStateFunction(
    id: string,
    stateRequest: ITournamentStateRequest,
  ) {
    const response: AxiosResponse<any> = await this.httpService.axiosRef.put(
      `https://api.challonge.com/v2/application/tournaments/${id}/change_state.json`,
      stateRequest,
      this.injectHeaders(),
    );
    return response.data;
  }

  async updateTournamentState(id: string, stageStatus: stageStatusEnum) {
    const stateRequest = stageStatusToTournamentStateRequest(stageStatus);
    return this.executeFunctionWithRetry(() =>
      this.updateTournamentStateFunction(id, stateRequest),
    );
  }

  /**
   * Gets all matches for a tournament from Challonge
   * @param tournamentId The Challonge tournament ID
   * @returns Array of matches from the Challonge API
   */
  async getMatches(tournamentId: string): Promise<IChallongeMatch[]> {
    try {
      const response = await this.httpService.axiosRef.get(
        `https://api.challonge.com/v2/application/tournaments/${tournamentId}/matches.json`,
        this.injectHeaders(),
      );

      if (response && response.data && response.data.data) {
        return response.data.data.map((match) => {
          return {
            id: match.id.toString(),
            round: match.attributes.round,
            state: match.attributes.state,
            player1Id: match.relationships.player1.data.id,
            player2Id: match.relationships.player2.data.id,
            winnerId: match.winnerId?.toString(),
            scoresCsv: match.attributes.scoresCsv,
            suggestedPlayOrder: match.attributes.suggestedPlayOrder,
          };
        });
      }

      return [];
    } catch (error) {
      console.error(
        `Error fetching matches from Challonge for tournament ${tournamentId}:`,
        error,
      );
      return [];
    }
  }
}
