import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { UserCredentialsDto } from './dto/userCredentials.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async verifyWithCredentials(
    email: string,
    password: string,
  ): Promise<string> {
    const user = (await this.userService.findOneByEmail<UserCredentialsDto>(
      email,
    )) satisfies UserCredentialsDto;

    if (!user) throw new NotFoundException();

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) throw new UnauthorizedException('Invalid password');

    return user.email;
  }

  generateExpirationData() {
    const date = new Date();

    date.setMilliseconds(
      (date.getTime() + +process.env.JWT_EXPIRATION_TIME) | 36000,
    );
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
  }
}
