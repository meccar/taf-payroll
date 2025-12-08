import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../guards';
import { AuthGuard as OAuthGuard } from '@nestjs/passport';
import { UserClaimDto } from 'src/shared/dtos';
import { GetUserClaimsUseCase } from 'src/application/usecases';

@Controller('user-claim')
@UseGuards(AuthGuard)
@UseGuards(OAuthGuard)
export class UserClaimController {
  constructor(private readonly getUserClaimsUseCase: GetUserClaimsUseCase) {}

  @Get(':userId')
  async getUserClaims(
    @Param('userId') userId: string,
  ): Promise<Array<UserClaimDto>> {
    return await this.getUserClaimsUseCase.execute(userId);
  }

  @Get(':userId/permissions')
  async getUserPermissions(@Param('userId') userId: string): Promise<string[]> {
    return await this.getUserClaimsUseCase.getPermissions(userId);
  }

  @Get(':userId/has-permission/:permission')
  async checkUserPermission(
    @Param('userId') userId: string,
    @Param('permission') permission: string,
  ): Promise<boolean> {
    return await this.getUserClaimsUseCase.hasPermission(userId, permission);
  }
}
