import { Injectable } from '@nestjs/common';
import { LoginDto } from 'src/shared/dtos/auth/login.dto';
import { UserService } from '../services';
import { UserMapper } from '../mappers/user.mapper';
import { Transactional } from 'src/infrastructure/database';
import { Transaction } from 'sequelize';

@Injectable()
export class LoginUseCase {
  constructor(private readonly userService: UserService) {}

  @Transactional()
  async execute(dto: LoginDto, transaction?: Transaction): Promise<string> {
    return await this.userService.login(UserMapper.toEntity(dto), transaction);
  }
}
