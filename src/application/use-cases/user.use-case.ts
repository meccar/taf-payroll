import { Injectable } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { User } from 'src/domain/entities';

@Injectable()
export class UserUseCase {
  constructor(private readonly userService: UserService) {}

  async listUsers(): Promise<User[]> {
    return this.userService.getUsers();
  }

  async createUser(user: Partial<User>): Promise<User> {
    return this.userService.createUser(user);
  }
}
