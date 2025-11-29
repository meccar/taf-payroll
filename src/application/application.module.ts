import { Module } from '@nestjs/common';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import {
  OAuthService,
  RoleClaimService,
  RoleService,
  UserClaimService,
  UserLoginService,
  UserRoleService,
  UserService,
  UserTokenService,
} from './services';
import { EmailListener } from './listeners/email.listener';
import {
  CreateUserUseCase,
  LoginUseCase,
  ForgotPasswordUseCase,
  ResetPasswordUseCase,
  ConfirmEmailUseCase,
  ResendConfirmationUseCase,
  Verify2FAUseCase,
  OAuthCallbackUseCase,
  OAuthValidateProviderUseCase,
  OAuthGetCallbackErrorUseCase,
} from './usecases';

@Module({
  imports: [InfrastructureModule],
  providers: [
    // Services
    UserService,
    RoleService,
    UserClaimService,
    RoleClaimService,
    UserLoginService,
    UserRoleService,
    UserTokenService,
    OAuthService,
    // Use Cases
    CreateUserUseCase,
    LoginUseCase,
    OAuthValidateProviderUseCase,
    OAuthCallbackUseCase,
    OAuthGetCallbackErrorUseCase,
    ForgotPasswordUseCase,
    ResetPasswordUseCase,
    ConfirmEmailUseCase,
    ResendConfirmationUseCase,
    Verify2FAUseCase,
    // Listeners
    EmailListener,
  ],
  exports: [
    CreateUserUseCase,
    LoginUseCase,
    OAuthValidateProviderUseCase,
    OAuthCallbackUseCase,
    OAuthGetCallbackErrorUseCase,
    ForgotPasswordUseCase,
    ResetPasswordUseCase,
    ConfirmEmailUseCase,
    ResendConfirmationUseCase,
    Verify2FAUseCase,
  ],
})
export class ApplicationModule {}
