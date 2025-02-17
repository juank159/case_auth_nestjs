// src/auth/auth.module.ts
import { Logger, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { FacebookStrategy } from './strategies/facebook.strategy';
import { AppleStrategy } from './strategies/apple.strategy';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from './entities/session.entity';
import { SessionsService } from './sessions/sessions.service';
import { AppMailerModule } from 'src/mailer/mailer.module';
import { FacebookAuthGuard } from './guards/social-auth.guard';
import { User } from 'src/users/entities/user.entity';
import { SessionMiddleware } from './middleware/session.middleware';

@Module({
  imports: [
    ConfigModule.forRoot(),
    UsersModule,
    AppMailerModule,
    TypeOrmModule.forFeature([Session, User]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('auth.jwt.secret'),
        signOptions: {
          expiresIn: config.get('auth.jwt.expiresIn'),
        },
      }),
    }),
  ],
  providers: [
    SessionMiddleware,
    AuthService,
    SessionsService,
    JwtStrategy,
    GoogleStrategy,
    FacebookAuthGuard,
    AppleStrategy,
    Logger,
  ],
  controllers: [AuthController],
  exports: [AuthService, SessionMiddleware],
})
export class AuthModule {}
