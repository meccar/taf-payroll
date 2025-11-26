import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length } from 'class-validator';
import { MESSAGES } from 'src/shared/messages';

export class Verify2FADto {
  @ApiProperty({
    description: 'The 2FA verification code',
    example: '123456',
    required: true,
    type: String,
    minLength: 6,
    maxLength: 6,
  })
  @IsString({
    message: MESSAGES.ERR_MUST_BE_A_STRING,
  })
  @IsNotEmpty({
    message: MESSAGES.ERR_REQUIRED,
  })
  @Length(6, 6, {
    message: MESSAGES.ERR_LENGTH,
  })
  code: string;
}
