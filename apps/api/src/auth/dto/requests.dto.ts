import { ApiProperty } from '@nestjs/swagger';
import {
  IChangePasswordRequest,
  IEmailPasswordLoginRequest,
} from '@tournament-app/types';
import { IsEmail, IsString } from 'class-validator';

export class LoginRequest implements IEmailPasswordLoginRequest {
  @IsString()
  @IsEmail()
  @ApiProperty()
  email: string;

  @IsString()
  @ApiProperty()
  password: string;
}

export class ChangePasswordRequest implements IChangePasswordRequest {
  @IsString()
  @ApiProperty()
  currentPassword: string;

  @IsString()
  @ApiProperty()
  newPassword: string;
}

export class SendResetPasswordEmailRequest {
  @IsString()
  @IsEmail()
  @ApiProperty()
  email: string;
}

export class ResetPasswordRequest {
  @IsString()
  @ApiProperty()
  newPassword: string;
}

export class UpdateEmailRequest {
  @IsString()
  @ApiProperty()
  currentPassword: string;

  @IsString()
  @IsEmail()
  email: string;
}
