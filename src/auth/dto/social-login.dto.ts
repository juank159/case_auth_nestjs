import { IsString, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SocialLoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email from social provider',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'User name from social provider',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: '12345678',
    description: 'User ID from social provider',
  })
  @IsString()
  id: string;
}
