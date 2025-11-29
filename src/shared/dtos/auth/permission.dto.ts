import { ApiProperty } from '@nestjs/swagger';

export class PermissionDto {
  @ApiProperty()
  permissions: string[];
}
