import { Module } from '@nestjs/common';
import { ApplicationModule } from '../application/application.module';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { UserController } from './controllers/user.controller';
import { AuthController } from './controllers/auth.controller';
import { OAuthController } from './controllers/oauth.controller';
import { RoleController } from './controllers/role.controller';
import { RoleClaimController } from './controllers/role-claim.controller';
import { UserRoleController } from './controllers/user-role.controller';
import { UserClaimController } from './controllers/user-claim.controller';

@Module({
  imports: [InfrastructureModule, ApplicationModule],
  controllers: [
    UserController,
    AuthController,
    OAuthController,
    RoleController,
    RoleClaimController,
    UserRoleController,
    UserClaimController,
  ],
  providers: [],
})
export class PresentationModule {}
