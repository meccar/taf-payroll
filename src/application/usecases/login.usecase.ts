import { LoginDto } from 'src/shared/dtos/auth/login.dto';
import { UserService } from '../services';
import { UserMapper } from '../mappers/user.mapper';

export class LoginUseCase {
  constructor(private readonly userService: UserService) {}

  async execute(dto: LoginDto): Promise<string> {
    return await this.userService.login(UserMapper.toEntity(dto));
  }
}
