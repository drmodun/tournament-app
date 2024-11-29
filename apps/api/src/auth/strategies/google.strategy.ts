import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { UsersService } from 'src/users/users.service';
import { UserCredentialsDto } from '../dto/userCredentials.dto';
import { UserDtosEnum } from 'src/users/types';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly usersService: UsersService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(profile: any, done: VerifyCallback): Promise<VerifyCallback> {
    const { name, emails, photos } = profile;

    const check = await this.usersService.findOneByEmail<UserCredentialsDto>(
      emails[0].value,
      UserDtosEnum.CREDENTIALS,
    );

    if (!check) return;

    const user = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos[0].value,
      id: check.id,
      username: check.username,
    };

    done(null, user);
  }
}
