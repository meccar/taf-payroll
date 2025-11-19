import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ConfirmEmailDto {
  @ApiProperty({
    description: 'The email confirmation token',
    example: 'abc123def456...',
    required: true,
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}
