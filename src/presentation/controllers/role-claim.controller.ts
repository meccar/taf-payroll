import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  PermissionGuard,
  RequirePermission,
} from '../decorators/permission.decorator';
import { ClaimDto, PermissionDto } from 'src/shared/dtos';
import {
  AddPermissionToRoleUseCase,
  CreateRoleClaimUseCase,
  GetRoleClaimUseCase,
} from 'src/application/usecases';

@Controller('role')
@UseGuards(PermissionGuard)
export class RoleController {
  constructor(
    private readonly getRoleClaimUseCase: GetRoleClaimUseCase,
    private readonly createRoleClaimUseCase: CreateRoleClaimUseCase,
    private readonly addPermissionToRoleUseCase: AddPermissionToRoleUseCase,
  ) {}

  @Get(':roleId/claims')
  @RequirePermission('role.manage')
  async getRoleClaim(@Param('roleId') roleId: string) {
    return this.getRoleClaimUseCase.execute(roleId);
  }

  @Post(':roleId/claims')
  @RequirePermission('role.manage')
  async addClaim(@Param('roleId') roleId: string, @Body() claim: ClaimDto) {
    return this.createRoleClaimUseCase.execute(roleId, claim);
  }

  @Put(':roleId/permissions')
  @RequirePermission('role.manage')
  async setRolePermission(
    @Param('roleId') roleId: string,
    @Body() permissions: PermissionDto[],
  ) {
    return this.addPermissionToRoleUseCase.execute(roleId, permissions);
  }
}
