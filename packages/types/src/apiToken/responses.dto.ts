import { apiTokenScopeEnumType } from "src/enums";

export interface IApiTokenResponse {
  id: number;
  name: string;
  // Shown as `wsh_<prefix>…`
  prefix: string;
  scopes: apiTokenScopeEnumType[];
  createdAt: Date;
  // Null: never expires
  expiresAt: Date | null;
  lastUsedAt: Date | null;
  revokedAt: Date | null;
}

// The token itself is only in the answer to its creation
export interface ICreatedApiTokenResponse extends IApiTokenResponse {
  token: string;
}

export interface IApiTokenUsageResponse {
  // YYYY-MM-DD, UTC
  day: string;
  requests: number;
}

export interface IRevokeAllApiTokensResponse {
  revoked: number;
}
