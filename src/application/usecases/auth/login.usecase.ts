import { Injectable } from '@nestjs/common';
import { LoginDto } from 'src/shared/dtos/auth/login.dto';
import { Transactional } from 'src/infrastructure/database';
import { Transaction } from 'sequelize';
import { UserService } from 'src/application/services';
import { UserMapper } from 'src/application/mappers/user.mapper';

@Injectable()
export class LoginUseCase {
  constructor(private readonly userService: UserService) {}

  @Transactional()
  async execute(dto: LoginDto, transaction?: Transaction): Promise<string> {
    return await this.userService.login(UserMapper.toEntity(dto), transaction);
  }
}
