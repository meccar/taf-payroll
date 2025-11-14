import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({
    description: 'Signed PASETO access token',
    example: 'v4.public.eyJzdWIiOiIxMjM0NTY3ODkwIn0',
  })
  token: string;
}
