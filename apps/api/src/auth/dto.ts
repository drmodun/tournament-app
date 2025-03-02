import { ApiProperty } from '@nestjs/swagger';
import { IsStrongPassword } from 'class-validator';

export interface RefreshTokenRequest {
  user: {
    refreshToken: string;
  };
}

export class PasswordResetRequest {
  @IsStrongPassword()
  @ApiProperty()
  password: string;
}
