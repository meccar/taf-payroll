import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { EmailOptions } from './email.service';

@Injectable()
export class EmailQueueService {
  constructor(@InjectQueue('email') private readonly emailQueue: Queue) {}

  async sendEmail(options: EmailOptions): Promise<void> {
    await this.emailQueue.add('send-email', { options });
  }

  async sendEmailConfirmation(email: string, token: string): Promise<void> {
    await this.emailQueue.add('send-confirmation', { email, token });
  }

  async sendEmailResetPassword(email: string, token: string): Promise<void> {
    await this.emailQueue.add('send-reset-password', { email, token });
  }
}
