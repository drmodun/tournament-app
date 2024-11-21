import { UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { UsersService } from 'src/users/users.service';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ValidatedUserDto } from '../dto/validatedUser.dto';
import { UserResponsesEnum } from '@tournament-app/types';
import { AdminUserResponse } from 'src/users/dto/responses.dto';
import { UserDtosEnum } from 'src/users/types';

export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any): Promise<ValidatedUserDto | null> {
    const authUser = (await this.userService.findOne<ValidatedUserDto>(
      payload.id,
      UserDtosEnum.ValidatedUserDto,
    )) satisfies ValidatedUserDto;

    if (!authUser) {
      throw new UnauthorizedException();
    }

    return {
      id: authUser.id,
      email: authUser.email,
      role: authUser.role,
    };
  }
}
