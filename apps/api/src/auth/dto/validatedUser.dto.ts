import { userRoleEnumType } from '@tournament-app/types';

export interface ValidatedUserDto {
  id: number;
  email: string;
  role: userRoleEnumType;
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

export interface SseTokenDto {
  sseToken: string;
}
