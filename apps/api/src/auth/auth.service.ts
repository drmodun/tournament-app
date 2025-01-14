import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { UserCredentialsDto } from './dto/userCredentials.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import {
  IUserLoginResponse,
  userRoleEnum,
  userRoleEnumType,
} from '@tournament-app/types';
import { UserDtosEnum } from 'src/users/types';
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
      UserDtosEnum.CREDENTIALS,
    )) satisfies UserCredentialsDto;

    if (!user) throw new NotFoundException();

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) throw new UnauthorizedException('Invalid password');

    return await this.getTokens(
      user.id,
      user.email,
      user.role as userRoleEnumType,
    );
  }

  async getTokens(
    userId: number,
    email: string,
    role: userRoleEnumType = userRoleEnum.USER,
  ) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
          role,
        },
        {
          secret: process.env.JWT_SECRET,
          expiresIn: '15m',
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
          role,
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

    return this.getTokens(payload.sub, payload.email);
  }

  async validateUser(payload: any) {
    const user = await this.userService.findOne(payload.id);
    if (!user) throw new UnauthorizedException();
    return user;
  }
}
