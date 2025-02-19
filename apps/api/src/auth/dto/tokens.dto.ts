import { ApiResponseProperty } from '@nestjs/swagger';
import { IUserLoginResponse } from '@tournament-app/types';

export class TokensResponse implements IUserLoginResponse {
  @ApiResponseProperty()
  accessToken: string;

  @ApiResponseProperty()
  refreshToken: string;
}
