import { UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { UsersService } from 'src/users/users.service';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ValidatedUserDto } from '../dto/validatedUser.dto';
import { UserDtosEnum } from 'src/users/types';
import { Request } from 'express';

type JwtPayload = {
  id: number;
  email: string;
  role: string;
};

export class AccessTokenStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: JwtPayload): Promise<ValidatedUserDto | null> {
    const authUser = (await this.userService.findOne<ValidatedUserDto>(
      payload.id,
      UserDtosEnum.VALIDATED,
    )) satisfies ValidatedUserDto;

    if (!authUser) {
      throw new UnauthorizedException();
    }

    return authUser;
  }
}
