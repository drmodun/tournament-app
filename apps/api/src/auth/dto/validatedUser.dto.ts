import { apiTokenScopeEnumType, userRoleEnumType } from '@tournament-app/types';

export interface ValidatedUserDto {
  id: number;
  email: string;
  role: userRoleEnumType;
  // Set when the request came with a personal access token instead of a login
  tokenId?: number;
  scopes?: apiTokenScopeEnumType[];
}

export interface PasswordResetTokenDto {
  passwordResetToken: string;
  passwordResetTokenExpiresAt: Date;
  email: string;
  username: string;
}

export interface EmailConfirmationTokenDto {
  emailConfirmationToken: string;
  emailConfirmationTokenExpiresAt: Date;
}
