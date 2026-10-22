import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import { AccessTokenStrategy } from './strategies/accessToken.strategy';
import { RefreshTokenStrategy } from './strategies/refreshToken.strategy';
import { ApiTokenStrategy } from './strategies/apiToken.strategy';
import { ApiTokensModule } from 'src/api-tokens/api-tokens.module';

@Module({
  imports: [
    JwtModule.register({ secret: process.env.JWT_REFRESH_SECRET }),
    JwtModule.register({ secret: process.env.JWT_SECRET }),
    UsersModule,
    ApiTokensModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    ApiTokenStrategy,
  ],
})
export class AuthModule {}
