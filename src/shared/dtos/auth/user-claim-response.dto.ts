import { ApiProperty } from '@nestjs/swagger';

export class UserClaimDto {
  @ApiProperty({
    description: 'The type of the claim',
    example: 'Permission',
    type: String,
  })
  type: string;
  @ApiProperty({
    description: 'The value of the claim',
    example: 'Permission',
    type: String,
  })
  value: string;
}
