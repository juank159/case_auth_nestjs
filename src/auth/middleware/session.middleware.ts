import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { SessionsService } from '../sessions/sessions.service';

@Injectable()
export class SessionMiddleware implements NestMiddleware {
  constructor(
    private jwtService: JwtService,
    private sessionsService: SessionsService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = this.jwtService.verify(token);
      const sessions = await this.sessionsService.findActiveByUserId(
        payload.sub,
      );
      const isValidSession = sessions.some(
        (session) => session.token === token,
      );

      if (!isValidSession) {
        throw new UnauthorizedException('Session expired or invalid');
      }

      next();
    } catch {
      throw new UnauthorizedException();
    }
  }
}
