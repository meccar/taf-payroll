import { UserLoginMapper } from 'src/application/mappers/user-login.mapper';
import { UserLoginAdapter } from 'src/domain/adapters';
import { UserLoginResponseDto } from 'src/shared/dtos';

export class GetAllUserLoginUseCase {
  constructor(private readonly userLoginAdapter: UserLoginAdapter) {}

  async execute(userId: string): Promise<UserLoginResponseDto[]> {
    return UserLoginMapper.toArrayResponse(
      await this.userLoginAdapter.getLogins(userId),
    );
  }
}
