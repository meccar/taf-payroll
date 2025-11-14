import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { UserCreatedEvent } from '../../domain/events/user.events';
import { EmailQueueService } from '../../infrastructure/email/email-queue.service';

@Injectable()
export class EmailListener {
  constructor(private readonly emailQueueService: EmailQueueService) {}

  @OnEvent('user.created', { async: true })
  async handleUserCreatedEvent(event: UserCreatedEvent): Promise<void> {
    try {
      // Queue email sending
      await this.emailQueueService.sendEmailConfirmation(
        event.email,
        event.confirmationToken,
      );
    } catch (error: unknown) {
      // Log error but don't fail the event
      console.error('Failed to queue email confirmation:', error);
    }
  }
}
