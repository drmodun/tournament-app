import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from './types';
import {
  IChallongeMatch,
  IChallongeParticipant,
  IChallongeTournament,
  ICreateChallongeParticipantRequest,
  ICreateChallongeTournamentRequest,
  IMatchScoreRequest,
  IStageResponse,
  IUpdateChallongeTournamentRequest,
  IUpdateParticipantRequest,
  rosterToCreateParticipantRequest,
  stageToCreateTournamentRequest,
  IMiniRosterResponse,
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
      const response: AxiosResponse<{ access_token: string }> =
        await this.httpService.axiosRef.post(
          'https://api.challonge.com/oauth/token',
          {
            grant_type: 'client_credentials',
            client_id: process.env.CHALLONGE_CLIENT_ID || '',
            client_secret: process.env.CHALLONGE_CLIENT_SECRET || '',
          },
        );

      this.token = response.data.access_token;
    } catch (error) {
      this.logger.error(error);
    }
  }

  async createTournamentFunction(
    createTournamentDto: ICreateChallongeTournamentRequest,
  ) {
    const response: AxiosResponse<IChallongeTournament> =
      await this.httpService.axiosRef.post(
        'https://api.challonge.com/v2/tournaments.json',
        createTournamentDto,
        this.injectHeaders(),
      );

    return response.data;
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
        `https://api.challonge.com/v2/tournaments/${id}.json`,
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
        'Content-Type': 'application/json',
        AuthorizationType: 'v2',
        Authorization: `Bearer ${this.token}`,
      },
    };
  }
  async createParticipantFunction(
    createParticipantDto: ICreateChallongeParticipantRequest,
  ) {
    const response: AxiosResponse<IChallongeParticipant> =
      await this.httpService.axiosRef.post(
        'https://api.challonge.com/v2/participants.json',
        createParticipantDto,
        this.injectHeaders(),
      );

    return response.data;
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
        `https://api.challonge.com/v2/participants/${id}.json`,
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
    id: number,
    updateMatchupDto: IMatchScoreRequest,
  ): Promise<IChallongeMatch> {
    const response: AxiosResponse<IChallongeMatch> =
      await this.httpService.axiosRef.put(
        `https://api.challonge.com/v2/matchups/${id}.json`,
        updateMatchupDto,
        this.injectHeaders(),
      );

    return response.data;
  }

  async updateMatchup(
    id: number,
    updateMatchupDto: IMatchScoreRequest,
  ): Promise<IChallongeMatch> {
    return this.executeFunctionWithRetry(() =>
      this.updateMatchupFunction(id, updateMatchupDto),
    );
  }

  async deleteTournamentFunction(id: string) {
    await this.httpService.axiosRef.delete(
      `https://api.challonge.com/v2/tournaments/${id}.json`,
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
      `https://api.challonge.com/v2/participants/${id}.json`,
      this.injectHeaders(),
    );
  }

  async createChallongeTournamentFromStage(stage: IStageResponse) {
    const challongeTournament = stageToCreateTournamentRequest({
      id: stage.id,
      name: stage.name,
      description: stage.description,
      stageType: stage.stageType,
      startDate: stage.startDate,
    });
    return await this.createTournament(challongeTournament);
  }

  async createChallongeParticipantFromRoster(roster: IMiniRosterResponse) {
    const challongeParticipant = rosterToCreateParticipantRequest({
      id: roster.id,
    });
    return this.createParticipant(challongeParticipant);
  }

  async getTournamentFunction(id: string): Promise<IChallongeTournament> {
    const response: AxiosResponse<IChallongeTournament> =
      await this.httpService.axiosRef.get(
        `https://api.challonge.com/v2/tournaments/${id}.json`,
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
        `https://api.challonge.com/v2/tournaments/${id}/participants.json`,
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
    const response: AxiosResponse<IChallongeMatch[]> =
      await this.httpService.axiosRef.get(
        `https://api.challonge.com/v2/tournaments/${id}/matches.json`,
        this.injectHeaders(),
      );
    return response.data;
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
                  match.attributes.relationships.player1.data.id,
                ),
                name: `Roster-${participantToRosterMap.get(match.attributes.relationships.player1.data.id)}`,
              },
              {
                id: participantToRosterMap.get(
                  match.attributes.relationships.player2.data.id,
                ),
                name: `Roster-${participantToRosterMap.get(match.attributes.relationships.player2.data.id)}`,
              },
            ],
            winner: match.attributes.winner_id
              ? participantToRosterMap.get(
                  match.attributes.winner_id.toString(),
                )
              : undefined,
          })),
        })),
    };
  }
}
