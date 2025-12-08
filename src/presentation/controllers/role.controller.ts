import {
  Body,
  Controller,
  Delete,
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
import { AuthGuard } from '../guards';
import { MessageResponseDto, RoleDto, RoleResponseDto } from 'src/shared/dtos';
import {
  CreateRoleUseCase,
  DeleteRoleUseCase,
  GetAllRoleUseCase,
  UpdateRoleUseCase,
} from 'src/application/usecases';
import { AuthGuard as OAuthGuard } from '@nestjs/passport';

@Controller('role')
@UseGuards(AuthGuard)
@UseGuards(OAuthGuard)
@UseGuards(PermissionGuard)
export class RoleController {
  constructor(
    private readonly getAllRoleUseCase: GetAllRoleUseCase,
    private readonly createRoleUseCase: CreateRoleUseCase,
    private readonly updateRoleUseCase: UpdateRoleUseCase,
    private readonly deleteRoleUseCase: DeleteRoleUseCase,
  ) {}

  @Get()
  @RequirePermission('role.view')
  async getAllRole(): Promise<RoleResponseDto[]> {
    return await this.getAllRoleUseCase.execute();
  }

  @Post()
  @RequirePermission('role.create')
  async createRole(@Body() role: RoleDto): Promise<MessageResponseDto> {
    return await this.createRoleUseCase.execute(role);
  }

  @Put(':roleId')
  @RequirePermission('role.update')
  async updateRole(
    @Param('roleId') roleId: string,
    @Body() role: RoleDto,
  ): Promise<MessageResponseDto> {
    return await this.updateRoleUseCase.execute(roleId, role);
  }

  @Delete(':roleId')
  @RequirePermission('role.delete')
  async deleteRole(
    @Param('roleId') roleId: string,
  ): Promise<MessageResponseDto> {
    return await this.deleteRoleUseCase.execute(roleId);
  }
}
