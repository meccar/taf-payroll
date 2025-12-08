import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../user';

export class UserLoginResponseDto {
  @ApiProperty()
  loginProvider: string;

  @ApiProperty()
  providerKey: string;

  @ApiProperty({ required: false })
  providerDisplayName?: string;

  @ApiProperty()
  user: UserResponseDto;
}
