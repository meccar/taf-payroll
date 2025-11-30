import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  PermissionGuard,
  RequirePermission,
} from '../decorators/permission.decorator';
import { AuthGuard } from '../guards';
import {
  AddUserToRoleUseCase,
  GetAllUserRoleUseCase,
  GetRoleByUserUseCase,
  GetUserByRoleUseCase,
} from 'src/application/usecases';
import { MessageResponseDto, UserRoleResponseDto } from 'src/shared/dtos';
import { UpdateUserRoleUseCase } from 'src/application/usecases/role/update-user-role.usecase';
import { DeleteUserRoleUseCase } from 'src/application/usecases/user-role/delete-user-role.usecase';

@Controller('user-role')
@UseGuards(AuthGuard)
@UseGuards(PermissionGuard)
export class UserRoleController {
  constructor(
    private readonly addUserToRoleUseCase: AddUserToRoleUseCase,
    private readonly getAllUserRoleUseCase: GetAllUserRoleUseCase,
    private readonly updateUserRoleUseCase: UpdateUserRoleUseCase,
    private readonly deleteUserRoleUseCase: DeleteUserRoleUseCase,
    private readonly getUserByRoleUseCase: GetUserByRoleUseCase,
    private readonly getRoleByUserUseCase: GetRoleByUserUseCase,
  ) {}

  @Post()
  @RequirePermission('userRole.add')
  async addToRole(
    @Body() body: { userId: string; roleId: string },
  ): Promise<MessageResponseDto> {
    return this.addUserToRoleUseCase.execute(body.userId, body.roleId);
  }

  @Put()
  @RequirePermission('userRole.update')
  async updateUserRole(
    @Body() body: { userId: string; roleId: string },
  ): Promise<MessageResponseDto> {
    return this.updateUserRoleUseCase.execute(body.userId, body.roleId);
  }

  @Delete()
  @RequirePermission('userRole.delete')
  async removeFromRole(
    @Body() body: { userId: string; roleId: string },
  ): Promise<MessageResponseDto> {
    return this.deleteUserRoleUseCase.execute(body.userId, body.roleId);
  }

  @Get()
  @RequirePermission('userRole.get')
  async getAllUserRole(): Promise<UserRoleResponseDto[]> {
    return await this.getAllUserRoleUseCase.execute();
  }

  @Get('users')
  @RequirePermission('userRole.get')
  async getUsersByRole(
    @Query() query: { roleId: string },
  ): Promise<UserRoleResponseDto[]> {
    return this.getUserByRoleUseCase.execute(query.roleId);
  }

  @Get('roles')
  @RequirePermission('userRole.get')
  async getRolesByUser(
    @Query() query: { userId: string },
  ): Promise<UserRoleResponseDto[]> {
    return this.getRoleByUserUseCase.execute(query.userId);
  }
}
