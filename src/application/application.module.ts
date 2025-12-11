import { Module } from '@nestjs/common';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { OAuthService } from './services';
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
} from './usecases';

@Module({
  imports: [InfrastructureModule],
  providers: [
    // Services
    OAuthService,
    // Use Cases
    CreateUserUseCase,
    LoginUseCase,
    OAuthCallbackUseCase,
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
    OAuthCallbackUseCase,
    ForgotPasswordUseCase,
    ResetPasswordUseCase,
    ConfirmEmailUseCase,
    ResendConfirmationUseCase,
    Verify2FAUseCase,
  ],
})
export class ApplicationModule {}
