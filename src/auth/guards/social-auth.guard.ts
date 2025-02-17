import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {}

@Injectable()
export class FacebookAuthGuard extends AuthGuard('facebook') {}

@Injectable()
export class AppleAuthGuard extends AuthGuard('apple') {}
