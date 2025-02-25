import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { UsersService } from 'src/users/users.service';
import { UserDtosEnum } from 'src/users/types';
import { ValidatedUserDto } from '../dto/validatedUser.dto';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly usersService: UsersService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/google/callback',
      scope: ['email', 'profile'],
      passReqToCallback: true,
    });

    this.usersService = usersService;
  }

  async validate(profile: any, done: VerifyCallback): Promise<VerifyCallback> {
    const { emails } = profile;

    const check = await this.usersService.findOneByEmail<ValidatedUserDto>(
      emails[0].value,
      UserDtosEnum.VALIDATED,
    );

    const user = check || (await this.createAndGet(profile));

    done(null, user);
  }

  async createAndGet(profile: any): Promise<ValidatedUserDto> {
    const userId = await this.createIfNotExist(profile);

    if (!userId) {
      throw new InternalServerErrorException(
        'Error creating user or getting user id',
      );
    }

    const user = await this.usersService.findOne<ValidatedUserDto>(
      userId,
      UserDtosEnum.VALIDATED,
    );

    if (!user) {
      throw new InternalServerErrorException('Error getting user');
    }

    return user;
  }

  async createIfNotExist(profile: any): Promise<number> {
    const { name, emails, photos } = profile;

    const user = await this.usersService.create({
      email: emails[0].value,
      username: name.givenName,
      profilePicture: photos[0].value,
      country: 'None',
      isFake: false,
      name: name.givenName,
      password: crypto.randomUUID(),
    }); //TODO: remind the user to change their country and loacation

    return user?.id as number;
  }
}
