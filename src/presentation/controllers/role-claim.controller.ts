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
import {
  ClaimDto,
  MessageResponseDto,
  PermissionDto,
  RoleClaimResponseDto,
} from 'src/shared/dtos';
import {
  AddPermissionToRoleUseCase,
  CreateRoleClaimUseCase,
  GetRoleClaimUseCase,
} from 'src/application/usecases';
import { AuthGuard } from '../guards';

@Controller('role')
@UseGuards(AuthGuard)
@UseGuards(PermissionGuard)
export class RoleClaimController {
  constructor(
    private readonly getRoleClaimUseCase: GetRoleClaimUseCase,
    private readonly createRoleClaimUseCase: CreateRoleClaimUseCase,
    private readonly addPermissionToRoleUseCase: AddPermissionToRoleUseCase,
  ) {}

  @Get(':roleId/claims')
  @RequirePermission('role.manage')
  async getRoleClaim(
    @Param('roleId') roleId: string,
  ): Promise<RoleClaimResponseDto[]> {
    return await this.getRoleClaimUseCase.execute(roleId);
  }

  @Post(':roleId/claims')
  @RequirePermission('role.manage')
  async addClaim(
    @Param('roleId') roleId: string,
    @Body() claim: ClaimDto,
  ): Promise<MessageResponseDto> {
    return await this.createRoleClaimUseCase.execute(roleId, claim);
  }

  @Put(':roleId/permissions')
  @RequirePermission('role.manage')
  async setRolePermission(
    @Param('roleId') roleId: string,
    @Body() permissions: PermissionDto[],
  ): Promise<MessageResponseDto> {
    return await this.addPermissionToRoleUseCase.execute(roleId, permissions);
  }
}
