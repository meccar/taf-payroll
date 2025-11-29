import { ApiProperty } from '@nestjs/swagger';
import { RoleResponseDto } from '.';

export class UserRoleResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  roleId: string;

  @ApiProperty()
  role: RoleResponseDto;
}
