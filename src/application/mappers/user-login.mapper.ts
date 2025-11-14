import { PROVIDER } from 'src/shared/constants';
import type { UserLogin } from '../../domain/entities';
import type { LoginDto } from '../../shared/dtos/auth/login.dto';

export class UserLoginMapper {
  static toEntity(dto: LoginDto): Partial<UserLogin> {
    const providerKey = dto.username ?? dto.email;

    return {
      loginProvider: PROVIDER.GOOGLE,
      providerKey,
      providerDisplayName: providerKey ?? undefined,
    };
  }
}
