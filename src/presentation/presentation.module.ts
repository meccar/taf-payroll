import { Module } from '@nestjs/common';
import { ApplicationModule } from '../application/application.module';
import { UserController } from './controllers/user.controller';
import { UserLoginController } from './controllers/user-login.controller';

@Module({
  imports: [ApplicationModule],
  controllers: [UserController, UserLoginController],
})
export class PresentationModule {}
