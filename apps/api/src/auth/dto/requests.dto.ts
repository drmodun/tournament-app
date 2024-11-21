import {
  IChangePasswordRequest,
  IEmailPasswordLoginRequest,
} from '@tournament-app/types';
import { IsEmail, IsString } from 'class-validator';

export class LoginRequest implements IEmailPasswordLoginRequest {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class ChangePasswordRequest implements IChangePasswordRequest {
  @IsString()
  currentPassword: string;

  @IsString()
  newPassword: string;
}

export class SendResetPasswordEmailRequest {
  @IsString()
  @IsEmail()
  email: string;
}

export class ResetPasswordRequest {
  @IsString()
  newPassword: string;
}

export class UpdateEmailRequest {
  @IsString()
  currentPassword: string;

  @IsString()
  @IsEmail()
  email: string;
}
