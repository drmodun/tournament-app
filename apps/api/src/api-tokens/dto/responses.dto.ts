import { ApiResponseProperty } from '@nestjs/swagger';
import {
  apiTokenScopeEnum,
  apiTokenScopeEnumType,
  IApiTokenResponse,
  IApiTokenUsageResponse,
  ICreatedApiTokenResponse,
  IRevokeAllApiTokensResponse,
} from '@tournament-app/types';

export class ApiTokenResponse implements IApiTokenResponse {
  @ApiResponseProperty()
  id: number;

  @ApiResponseProperty()
  name: string;

  @ApiResponseProperty()
  prefix: string;

  @ApiResponseProperty({ enum: apiTokenScopeEnum })
  scopes: apiTokenScopeEnumType[];

  @ApiResponseProperty()
  createdAt: Date;

  @ApiResponseProperty()
  expiresAt: Date | null;

  @ApiResponseProperty()
  lastUsedAt: Date | null;

  @ApiResponseProperty()
  revokedAt: Date | null;
}

export class CreatedApiTokenResponse
  extends ApiTokenResponse
  implements ICreatedApiTokenResponse
{
  @ApiResponseProperty()
  token: string;
}

export class ApiTokenUsageResponse implements IApiTokenUsageResponse {
  @ApiResponseProperty()
  day: string;

  @ApiResponseProperty()
  requests: number;
}

export class RevokeAllApiTokensResponse implements IRevokeAllApiTokensResponse {
  @ApiResponseProperty()
  revoked: number;
}
