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
import { EmailListener } from './listeners/email.listener';
import { CreateUserUseCase } from './usecases/create-user.usecase';
import { LoginUseCase } from './usecases/login.usecase';

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
    CreateUserUseCase,
    LoginUseCase,
    // Listeners
    EmailListener,
  ],
  exports: [CreateUserUseCase, LoginUseCase],
})
export class ApplicationModule {}
