import { Module } from '@nestjs/common';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import {
  RoleClaimService,
  RoleService,
  UserClaimService,
  UserLoginService,
  UserService,
  UserTokenService,
} from './services';
import { UserUseCase } from './use-cases/user.use-case';

@Module({
  imports: [InfrastructureModule],
  providers: [
    // Services
    UserService,
    RoleService,
    UserClaimService,
    RoleClaimService,
    UserLoginService,
    UserTokenService,
    // Use Cases
    UserUseCase,
  ],
  exports: [UserUseCase],
})
export class ApplicationModule {}
