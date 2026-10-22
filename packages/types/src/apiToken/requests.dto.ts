import { apiTokenScopeEnumType } from "src/enums";

export interface ICreateApiTokenRequest {
  name: string;
  scopes: apiTokenScopeEnumType[];
  // Left out: 90 days. Null: never expires.
  expiresInDays?: number | null;
}
