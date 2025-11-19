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
import { ForgotPasswordUseCase } from './usecases/forgot-password.usecase';
import { ResetPasswordUseCase } from './usecases/reset-password.usecase';
import { ConfirmEmailUseCase } from './usecases/confirm-email.usecase';
import { ResendConfirmationUseCase } from './usecases/resend-confirmation.usecase';
import { Verify2FAUseCase } from './usecases/verify-2fa.usecase';
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
    OAuthUseCase,
    ForgotPasswordUseCase,
    ResetPasswordUseCase,
    ConfirmEmailUseCase,
    ResendConfirmationUseCase,
    Verify2FAUseCase,
  ],
})
export class ApplicationModule {}
