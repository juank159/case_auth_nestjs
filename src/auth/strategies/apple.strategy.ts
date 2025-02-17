import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-apple';

@Injectable()
export class AppleStrategy extends PassportStrategy(Strategy, 'apple') {
  constructor() {
    super({
      clientID: process.env.APPLE_CLIENT_ID,
      teamID: process.env.APPLE_TEAM_ID,
      keyID: process.env.APPLE_KEY_ID,
      callbackURL:
        process.env.APPLE_CALLBACK_URL ||
        'http://localhost:3000/auth/apple/callback',
      scope: ['email', 'name'],
    });
  }
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: Function,
  ) {
    const user = {
      email: profile.email,
      name: `${profile.name.firstName} ${profile.name.lastName}`,
      appleId: profile.id,
    };
    done(null, user);
  }
}
