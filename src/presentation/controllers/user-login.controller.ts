import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../guards';
import { UserLoginResponseDto } from 'src/shared/dtos';
import { GetAllUserLoginUseCase } from 'src/application/usecases';
import { RequirePermission } from '../decorators/permission.decorator';

@Controller('user-login')
@UseGuards(AuthGuard)
export class UserLoginController {
  constructor(
    private readonly getAllUserLoginUseCase: GetAllUserLoginUseCase,
  ) {}

  @Get(':userId/login-history')
  @RequirePermission('user.viewLoginHistory')
  async getLoginHistory(
    @Param('userId') userId: string,
  ): Promise<UserLoginResponseDto[]> {
    return await this.getAllUserLoginUseCase.execute(userId);
  }
}
