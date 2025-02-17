import {
  ConflictException,
  Injectable,
  Logger,
  LoggerService,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { EmailService } from 'src/mailer/mailer.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { User } from '../users/entities/user.entity';
import { randomUUID } from 'crypto';
import { SessionsService } from './sessions/sessions.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private logger: Logger,
    private sessionsService: SessionsService,
  ) {}

  async validateSocialLogin(provider: string, profile: any) {
    const email = profile.email;
    let user = await this.usersService.findByEmail(email);

    if (!user) {
      user = await this.usersService.create({
        email: profile.email,
        name: profile.name,
        [`${provider}Id`]: profile.id,
      });
    }

    return this.login(user);
  }

  async login(user: any) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.sign({ sub: user.id }, { expiresIn: '15m' }),
      this.jwtService.sign({ sub: user.id }, { expiresIn: '7d' }),
    ]);

    await this.sessionsService.create({
      user,
      token: accessToken,
      refreshToken,
      deviceInfo: 'web',
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
    });

    return this.login(user);
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.usersService.findById(userId);
    const isValidPassword = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!isValidPassword) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);
    await this.usersService.update(userId, { password: hashedPassword });
    await this.sessionsService.deactivateAllUserSessions(userId);

    return { message: 'Password updated successfully' };
  }

  async requestPasswordReset(email: string) {
    try {
      const user = await this.usersService.findByEmail(email);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const token = this.jwtService.sign(
        { sub: user.id },
        { expiresIn: '15m' },
      );

      await this.usersService.update(user.id, { resetToken: token });
      await this.emailService.sendPasswordReset(email, token);

      this.logger.log(`Password reset requested for ${email}`);
      return { message: 'Reset password email sent' };
    } catch (error) {
      this.logger.error(`Password reset failed for ${email}`, error.stack);
      throw error;
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    try {
      const payload = this.jwtService.verify(resetPasswordDto.token);
      const user = await this.usersService.findById(payload.sub);

      const hashedPassword = await bcrypt.hash(
        resetPasswordDto.newPassword,
        10,
      );
      await this.usersService.update(user.id, {
        password: hashedPassword,
        resetToken: null,
      });

      await this.sessionsService.deactivateAllUserSessions(user.id);

      return { message: 'Password reset successful' };
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async logout(sessionId: string) {
    await this.sessionsService.deactivate(sessionId);
    return { message: 'Logged out successfully' };
  }

  async getActiveSessions(userId: string) {
    return this.sessionsService.findActiveByUserId(userId);
  }

  async generateTokens(
    userId: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const jti = randomUUID();

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.sign({ sub: userId }, { expiresIn: '15m' }),
      this.jwtService.sign({ sub: userId, jti }, { expiresIn: '7d' }),
    ]);

    return { accessToken, refreshToken };
  }

  async refreshToken(oldRefreshToken: string) {
    try {
      const payload = this.jwtService.verify(oldRefreshToken) as TokenPayload;
      const session =
        await this.sessionsService.findByRefreshToken(oldRefreshToken);

      if (!session?.isActive) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const { accessToken, refreshToken } = await this.generateTokens(
        payload.sub,
      );

      await this.sessionsService.update(session.id, {
        token: accessToken,
        refreshToken,
        lastUsedAt: new Date(),
      });

      await this.sessionsService.invalidateToken(oldRefreshToken);

      return {
        access_token: accessToken,
        refresh_token: refreshToken,
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logoutAllSessions(userId: string) {
    await this.sessionsService.deactivateAllUserSessions(userId);
    return { message: 'All sessions logged out successfully' };
  }
}
