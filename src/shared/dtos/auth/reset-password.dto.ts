import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { MESSAGES } from 'src/shared/messages';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'The password reset token',
    example: 'abc123def456...',
    required: true,
    type: String,
  })
  @IsString({
    message: MESSAGES.ERR_MUST_BE_A_STRING,
  })
  @IsNotEmpty({
    message: MESSAGES.ERR_REQUIRED,
  })
  token: string;

  @ApiProperty({
    description: 'The new password',
    example: 'NewSecure@Password123',
    format: 'password',
    required: true,
    type: String,
    minLength: 8,
    maxLength: 20,
  })
  @IsString({
    message: MESSAGES.ERR_MUST_BE_A_STRING,
  })
  @IsNotEmpty({
    message: MESSAGES.ERR_REQUIRED,
  })
  @MinLength(8, {
    message: MESSAGES.ERR_MIN_LENGTH,
  })
  newPassword: string;
}
