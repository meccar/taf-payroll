import { ApiProperty } from '@nestjs/swagger';

export class RoleClaimResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  roleId: string;

  @ApiProperty()
  claimType: string;

  @ApiProperty()
  claimValue: string;
}
