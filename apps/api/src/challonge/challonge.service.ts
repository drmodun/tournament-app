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
  IRosterResponse,
  IUpdateChallongeTournamentRequest,
  IUpdateParticipantRequest,
  rosterToChallongeParticipant,
  rosterToCreateParticipantRequest,
  stageToChallongeTournament,
  stageToCreateTournamentRequest,
  rosterToUpdateParticipantRequest,
} from '@tournament-app/types';

@Injectable()
export class ChallongeService {
  private readonly logger = new Logger(ChallongeService.name);
  private token: string;

  constructor(private readonly httpService: HttpService) {
    if (
      !process.env.CHALLONGE_CLIENT_ID ||
      !process.env.CHALLONGE_CLIENT_SECRET
    ) {
      throw new Error(
        'CHALLONGE_CLIENT_ID and CHALLONGE_CLIENT_SECRET must be set',
      );
    }

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
            client_id: process.env.CHALLONGE_CLIENT_ID,
            client_secret: process.env.CHALLONGE_CLIENT_SECRET,
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
  ) {
    return this.executeFunctionWithRetry(() =>
      this.createTournamentFunction(createTournamentDto),
    );
  }

  async updateTournamentFunction(
    id: number,
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
    id: number,
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

  async deleteTournamentFunction(id: number) {
    await this.httpService.axiosRef.delete(
      `https://api.challonge.com/v2/tournaments/${id}.json`,
      this.injectHeaders(),
    );
  }

  async deleteTournament(id: number) {
    return this.executeFunctionWithRetry(() =>
      this.deleteTournamentFunction(id),
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
    return this.createTournament(challongeTournament);
  }

  async createChallongeParticipantFromRoster(roster: IRosterResponse) {
    const challongeParticipant = rosterToCreateParticipantRequest({
      id: roster.id,
    });
    return this.createParticipant(challongeParticipant);
  }
}
