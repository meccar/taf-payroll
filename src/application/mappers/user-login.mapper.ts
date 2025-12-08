import { PROVIDER } from 'src/shared/constants';
import type { UserLogin } from '../../domain/entities';
import type { LoginDto } from '../../shared/dtos/auth/login.dto';
import { UserLoginResponseDto } from 'src/shared/dtos';
import { UserMapper } from './user.mapper';

export class UserLoginMapper {
  static toEntity(dto: LoginDto): Partial<UserLogin> {
    const providerKey = dto.username ?? dto.email;

    return {
      loginProvider: PROVIDER.GOOGLE,
      providerKey,
      providerDisplayName: providerKey ?? undefined,
    };
  }

  static toArrayResponse(entity: UserLogin[]): UserLoginResponseDto[] {
    return entity.map((item) => this.toResponse(item));
  }

  static toResponse(entity: UserLogin): UserLoginResponseDto {
    return {
      loginProvider: entity.loginProvider,
      providerKey: entity.providerKey,
      providerDisplayName: entity.providerDisplayName,
      user: UserMapper.toResponse(entity.user),
    };
  }
}
