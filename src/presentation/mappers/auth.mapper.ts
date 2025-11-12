import { User } from 'src/domain/entities';
import { LoginDto } from '../dtos/auth/login.dto';
import { LoginResponseDto } from '../dtos/auth/login-response.dto';

export class AuthMapper {
  static toEntity(dto: LoginDto): Partial<User> {
    return {
      userName: dto.username,
      normalizedUserName: dto.username?.toUpperCase(),
      email: dto.email,
      normalizedEmail: dto.email?.toUpperCase(),
      passwordHash: dto.password,
    };
  }

  static toResponse(token: string): LoginResponseDto {
    return {
      token: token,
    };
  }
}
