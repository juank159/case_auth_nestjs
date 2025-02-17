import { IsEmail, IsString, Validate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StrongPasswordValidator } from '../validators/password.validator';

export class RequestPasswordResetDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email address to send password reset link',
  })
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Password reset token received by email',
  })
  @IsString()
  token: string;

  @ApiProperty({
    example: 'NewStrongPass123!',
    description:
      'New password (must contain uppercase, lowercase, number and special character)',
  })
  @Validate(StrongPasswordValidator)
  newPassword: string;
}
