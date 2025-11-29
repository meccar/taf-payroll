import { ApiProperty } from '@nestjs/swagger';

export class ClaimDto {
  @ApiProperty()
  claimType: string;

  @ApiProperty()
  claimValue: string;
}
