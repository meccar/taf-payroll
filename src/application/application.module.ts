import { Module } from '@nestjs/common';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { OAuthService } from './services';
import { EmailListener } from './listeners/email.listener';
import {
  CreateUserUseCase,
  GetAllUserLoginUseCase,
  LoginUseCase,
  ForgotPasswordUseCase,
  ResetPasswordUseCase,
  ConfirmEmailUseCase,
  ResendConfirmationUseCase,
  Verify2FAUseCase,
  OAuthCallbackUseCase,
  // Role
  GetAllRoleUseCase,
  CreateRoleUseCase,
  UpdateRoleUseCase,
  DeleteRoleUseCase,
  // Role claims
  GetRoleClaimUseCase,
  CreateRoleClaimUseCase,
  AddPermissionToRoleUseCase,
  // User role
  AddUserToRoleUseCase,
  GetAllUserRoleUseCase,
  GetUserByRoleUseCase,
  GetRoleByUserUseCase,
  UpdateUserRoleUseCase,
  DeleteUserRoleUseCase,
  // User claim
  GetUserClaimsUseCase,
} from './usecases';
import { OAuthGetCallbackErrorUseCase } from './usecases/auth/oauth-get-callback-error.usecase';
import { OAuthValidateProviderUseCase } from './usecases/auth/oauth-validate-provider.usecase';

@Module({
  imports: [InfrastructureModule],
  providers: [
    // Services
    OAuthService,
    // Use Cases
    CreateUserUseCase,
    GetAllUserLoginUseCase,
    LoginUseCase,
    OAuthCallbackUseCase,
    OAuthGetCallbackErrorUseCase,
    OAuthValidateProviderUseCase,
    // Role
    GetAllRoleUseCase,
    CreateRoleUseCase,
    UpdateRoleUseCase,
    DeleteRoleUseCase,
    // Role claims
    GetRoleClaimUseCase,
    CreateRoleClaimUseCase,
    AddPermissionToRoleUseCase,
    // User role
    AddUserToRoleUseCase,
    GetAllUserRoleUseCase,
    UpdateUserRoleUseCase,
    DeleteUserRoleUseCase,
    GetUserByRoleUseCase,
    GetRoleByUserUseCase,
    // User claim
    GetUserClaimsUseCase,
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
    GetAllUserLoginUseCase,
    LoginUseCase,
    OAuthCallbackUseCase,
    OAuthGetCallbackErrorUseCase,
    OAuthValidateProviderUseCase,
    // Role
    GetAllRoleUseCase,
    CreateRoleUseCase,
    UpdateRoleUseCase,
    DeleteRoleUseCase,
    // Role claims
    GetRoleClaimUseCase,
    CreateRoleClaimUseCase,
    AddPermissionToRoleUseCase,
    // User role
    AddUserToRoleUseCase,
    GetAllUserRoleUseCase,
    UpdateUserRoleUseCase,
    DeleteUserRoleUseCase,
    GetUserByRoleUseCase,
    GetRoleByUserUseCase,
    // User claim
    GetUserClaimsUseCase,
    ForgotPasswordUseCase,
    ResetPasswordUseCase,
    ConfirmEmailUseCase,
    ResendConfirmationUseCase,
    Verify2FAUseCase,
  ],
})
export class ApplicationModule {}
