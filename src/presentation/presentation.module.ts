import { Module } from '@nestjs/common';
import { ApplicationModule } from '../application/application.module';
import { UserController } from './controllers/user.controller';
import { AuthController } from './controllers/auth.controller';

@Module({
  imports: [ApplicationModule],
  controllers: [UserController, AuthController],
})
export class PresentationModule {}
