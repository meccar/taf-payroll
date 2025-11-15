import type { User } from '../../domain/entities';
import { LoginDto } from '../../shared/dtos/auth/login.dto';
import type { CreateUserDto } from '../../shared/dtos/user/create-user.dto';
import { UserResponseDto } from '../../shared/dtos/user/user-response.dto';

export class UserMapper {
  static toEntity(dto: CreateUserDto | LoginDto): Partial<User> {
    return {
      userName: dto.username,
      normalizedUserName: dto.username?.toUpperCase(),
      email: dto.email,
      normalizedEmail: dto.email?.toUpperCase(),
      passwordHash: dto.password,
    };
  }

  static toResponse(user: User): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.username = user.userName;
    dto.email = user.email;
    dto.phoneNumber = user.phoneNumber;
    return dto;
  }

  static toResponseList(users: User[]): UserResponseDto[] {
    return users.map((user) => this.toResponse(user));
  }
}
