import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { MESSAGES } from 'src/shared/messages';

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'The email address of the user',
    example: 'user@example.com',
    format: 'email',
    required: true,
    type: String,
  })
  @IsEmail(
    {},
    {
      message: MESSAGES.ERR_EMAIL_FORMAT,
    },
  )
  @IsNotEmpty({
    message: MESSAGES.ERR_REQUIRED,
  })
  email: string;
}
