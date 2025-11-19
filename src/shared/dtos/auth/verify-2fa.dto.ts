import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length } from 'class-validator';

export class Verify2FADto {
  @ApiProperty({
    description: 'The 2FA verification code',
    example: '123456',
    required: true,
    type: String,
    minLength: 6,
    maxLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  code: string;
}
