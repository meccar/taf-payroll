import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { EmailService } from './email.service';
import { EmailProcessor } from './email.processor';
import { EmailQueueService } from './email-queue.service';
import emailConfig from './email.config';

@Module({
  imports: [
    ConfigModule.forFeature(emailConfig),
    BullModule.registerQueue({
      name: 'email',
    }),
  ],
  providers: [EmailService, EmailProcessor, EmailQueueService],
  exports: [EmailService, EmailQueueService, BullModule],
})
export class EmailModule {}
