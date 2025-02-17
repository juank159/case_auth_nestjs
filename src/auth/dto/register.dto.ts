import { IsEmail, IsString, MinLength, Validate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StrongPasswordValidator } from '../validators/password.validator';

export class RegisterDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'StrongPass123!',
    description:
      'Password (must contain uppercase, lowercase, number and special character)',
  })
  @Validate(StrongPasswordValidator)
  password: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Full name',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: '+1234567890',
    description: 'Phone number',
  })
  @IsString()
  phone: string;
}
