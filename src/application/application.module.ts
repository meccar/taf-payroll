import { Module } from '@nestjs/common';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import {
  OAuthService,
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
import { OAuthUseCase } from './usecases/oauth.usecase';

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
    OAuthService,
    // Use Cases
    CreateUserUseCase,
    LoginUseCase,
    OAuthUseCase,
    // Listeners
    EmailListener,
  ],
  exports: [CreateUserUseCase, LoginUseCase, OAuthUseCase],
})
export class ApplicationModule {}
