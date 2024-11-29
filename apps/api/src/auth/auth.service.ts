import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { UserCredentialsDto } from './dto/userCredentials.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { IUserLoginResponse } from '@tournament-app/types';
@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async verifyWithCredentials(
    email: string,
    password: string,
  ): Promise<IUserLoginResponse> {
    const user = (await this.userService.findOneByEmail<UserCredentialsDto>(
      email,
    )) satisfies UserCredentialsDto;

    if (!user) throw new NotFoundException();

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) throw new UnauthorizedException('Invalid password');

    return await this.getTokens(user.id, user.username);
  }

  async getTokens(userId: string, username: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          username,
        },
        {
          secret: process.env.JWT_SECRET,
          expiresIn: '15m',
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          username,
        },
        {
          secret: process.env.JWT_REFRESH_SECRET,
          expiresIn: '7d',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(refreshToken: string) {
    const payload = await this.jwtService.verifyAsync(refreshToken, {
      secret: process.env.JWT_REFRESH_SECRET,
    });

    return this.getTokens(payload.sub, payload.username);
  }

  async validateUser(payload: any) {
    const user = await this.userService.findOne(payload.id);
    if (!user) throw new UnauthorizedException();
    return user;
  }
}
