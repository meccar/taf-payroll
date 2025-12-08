import { UserLoginMapper } from 'src/application/mappers/user-login.mapper';
import { UserLoginService } from 'src/application/services';
import { UserLoginResponseDto } from 'src/shared/dtos';

export class GetAllUserLoginUseCase {
  constructor(private readonly userLoginService: UserLoginService) {}

  async execute(userId: string): Promise<UserLoginResponseDto[]> {
    return UserLoginMapper.toArrayResponse(
      await this.userLoginService.getLogins(userId),
    );
  }
}
