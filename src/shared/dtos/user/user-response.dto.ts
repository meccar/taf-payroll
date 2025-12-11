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
  username: string | null;

  @ApiPropertyOptional({
    description: 'Email address of the user',
    example: 'john.doe@example.com',
    maxLength: 256,
  })
  email: string | null;

  @ApiPropertyOptional({
    description: 'Phone number associated with the user',
    example: '+15551234567',
    maxLength: 32,
  })
  phoneNumber: string | null;
}
