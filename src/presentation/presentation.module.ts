import { Module } from '@nestjs/common';
import { ApplicationModule } from '../application/application.module';
import { UserController } from './controllers/user.controller';
import { AuthController } from './controllers/auth.controller';
import { OAuthController } from './controllers/oauth.controller';
import { RoleController } from './controllers/role.controller';
import { RoleClaimController } from './controllers/role-claim.controller';
import { UserRoleController } from './controllers/user-role.controller';
import { GoogleStrategy } from './strategies/google.strategy';
import { UserClaimController } from './controllers/user-claim.controller';

@Module({
  imports: [ApplicationModule],
  controllers: [
    UserController,
    AuthController,
    OAuthController,
    RoleController,
    RoleClaimController,
    UserRoleController,
    UserClaimController,
  ],
  providers: [GoogleStrategy],
})
export class PresentationModule {}
