import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import {
  GoogleAuthGuard,
  FacebookAuthGuard,
  AppleAuthGuard,
} from './guards/social-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import {
  RequestPasswordResetDto,
  ResetPasswordDto,
} from './dto/reset-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Controller('auth')
@UseInterceptors(TransformInterceptor)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  //@UseGuards(JwtAuthGuard)
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    return this.authService.login(user);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleAuth() {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Req() req) {
    return this.authService.validateSocialLogin('google', req.user);
  }

  @Get('facebook')
  @UseGuards(FacebookAuthGuard)
  facebookAuth() {}

  @Get('facebook/callback')
  @UseGuards(FacebookAuthGuard)
  async facebookAuthRedirect(@Req() req) {
    return this.authService.validateSocialLogin('facebook', req.user);
  }

  @Get('apple')
  @UseGuards(AppleAuthGuard)
  appleAuth() {}

  @Get('apple/callback')
  @UseGuards(AppleAuthGuard)
  async appleAuthRedirect(@Req() req) {
    return this.authService.validateSocialLogin('apple', req.user);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@CurrentUser() user) {
    return user;
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @CurrentUser() user,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(user.id, changePasswordDto);
  }

  @Post('forgot-password')
  async requestPasswordReset(
    @Body() requestPasswordResetDto: RequestPasswordResetDto,
  ) {
    return this.authService.requestPasswordReset(requestPasswordResetDto.email);
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  async getActiveSessions(@CurrentUser() user) {
    return this.authService.getActiveSessions(user.id);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Body() { sessionId }: { sessionId: string }) {
    return this.authService.logout(sessionId);
  }

  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  async logoutAll(@CurrentUser() user) {
    return this.authService.logoutAllSessions(user.id);
  }

  @Post('refresh')
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }
}
