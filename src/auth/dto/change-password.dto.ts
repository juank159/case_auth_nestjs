import { IsString, Validate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StrongPasswordValidator } from '../validators/password.validator';

export class ChangePasswordDto {
  @ApiProperty({
    example: 'currentPass123!',
    description: 'Current password',
  })
  @IsString()
  currentPassword: string;

  @ApiProperty({
    example: 'newStrongPass123!',
    description:
      'New password (must contain uppercase, lowercase, number and special character)',
  })
  @Validate(StrongPasswordValidator)
  newPassword: string;
}
