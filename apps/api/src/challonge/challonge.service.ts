import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from './types';

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
}
