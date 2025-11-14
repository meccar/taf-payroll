import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the user',
    example: '01JH4M9G6T9N6S8B7W4F2X1Y0Z',
  })
  id: string;

  @ApiPropertyOptional({
    description: 'Username of the user',
    example: 'john.doe',
    maxLength: 256,
  })
  username?: string;

  @ApiPropertyOptional({
    description: 'Email address of the user',
    example: 'john.doe@example.com',
    maxLength: 256,
  })
  email?: string;

  @ApiPropertyOptional({
    description: 'Phone number associated with the user',
    example: '+15551234567',
    maxLength: 32,
  })
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: 'Email confirmation token (only returned on user creation)',
    example: 'a1b2c3d4e5f6...',
  })
  confirmationToken?: string | null;
}
