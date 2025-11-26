import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import { MESSAGES } from 'src/shared/messages';

export class ConfirmEmailDto {
  @ApiProperty({
    description: 'The email confirmation token',
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
}
