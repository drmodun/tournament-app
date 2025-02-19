import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginRequest } from './dto/requests.dto';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { TokensResponse } from './dto/tokens.dto';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { GoogleStrategy } from './strategies/google.strategy';
import { RefreshToken } from 'src/base/decorators/refreshToken.decorator';
import { CurrentUser } from 'src/base/decorators/currentUser.decorator';
import { ValidatedUserDto } from './dto/validatedUser.dto';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOkResponse({
    type: TokensResponse,
  })
  async login(@Body() loginRequest: LoginRequest) {
    return await this.authService.verifyWithCredentials(
      loginRequest.email,
      loginRequest.password,
    );
  }

  @Get('refresh')
  @ApiUnauthorizedResponse()
  @UseGuards(RefreshTokenGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    type: TokensResponse,
  })
  async refresh(@RefreshToken() refreshToken: string) {
    return await this.authService.refreshTokens(refreshToken);
  }

  @Get('google')
  @UseGuards(GoogleStrategy)
  auth() {}

  @Get('google/callback')
  @ApiOkResponse({
    type: TokensResponse,
  })
  @UseGuards(GoogleStrategy)
  @ApiBearerAuth()
  async authCallback(@CurrentUser() user: ValidatedUserDto) {
    const tokens = await this.authService.getTokens(user.id, user.email);

    return tokens;
  }
}
