import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { getTypeOrmConfig } from './auth/config/typeorm.config';
import { validationSchema } from './auth/config/validation.schema';
import { SessionMiddleware } from './auth/middleware/session.middleware';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema,
      validationOptions: {
        abortEarly: false,
      },
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: getTypeOrmConfig,
    }),
    UsersModule,
    AuthModule,
  ],
})
export class AppModule implements NestModule {
  constructor(private sessionMiddleware: SessionMiddleware) {}

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(this.sessionMiddleware.use.bind(this.sessionMiddleware))
      .exclude(
        'auth/login',
        'auth/register',
        'auth/google(.*)',
        'auth/facebook(.*)',
        'auth/apple(.*)',
        'auth/forgot-password',
        'auth/reset-password',
      )
      .forRoutes('*');
  }
}
