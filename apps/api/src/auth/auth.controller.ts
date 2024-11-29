import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginRequest } from './dto/requests.dto';
import { ApiOkResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { TokensResponse } from './dto/tokens.dto';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { RefreshTokenRequest } from './dto';
import { GoogleStrategy } from './strategies/google.strategy';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOkResponse({
    type: TokensResponse,
  })
  login(@Body() loginRequest: LoginRequest) {
    return this.authService.verifyWithCredentials(
      loginRequest.email,
      loginRequest.password,
    );
  }

  @Get('refresh')
  @ApiUnauthorizedResponse()
  @ApiOkResponse({
    type: TokensResponse,
  })
  @UseGuards(RefreshTokenGuard)
  refresh(@Req() { user: { refreshToken } }: RefreshTokenRequest) {
    return this.authService.refreshTokens(refreshToken);
  }

  @Get('google')
  @UseGuards(GoogleStrategy)
  auth() {}

  @Get('google/callback')
  @UseGuards(GoogleStrategy)
  authCallback(@Req() { user }: any) {
    const tokens = this.authService.getTokens(user.id, user.username);

    return tokens;
  }
}
