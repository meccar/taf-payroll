import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { EmailService, EmailOptions } from './email.service';

export interface EmailJobData {
  options: EmailOptions;
}

@Injectable()
@Processor('email')
export class EmailProcessor extends WorkerHost {
  constructor(private readonly emailService: EmailService) {
    super();
  }

  async process(
    job: Job<EmailJobData | { email: string; token: string }>,
  ): Promise<void> {
    if (job.name === 'send-email') {
      const { options } = job.data as EmailJobData;
      await this.emailService.sendEmail(options);
    } else if (job.name === 'send-confirmation') {
      const { email, token } = job.data as { email: string; token: string };
      await this.emailService.sendEmailConfirmation(email, token);
    }
  }
}
