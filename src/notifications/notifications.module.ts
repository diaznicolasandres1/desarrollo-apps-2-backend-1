import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { EventNotificationService } from './event-notification.service';
import { EventNotificationProcessor } from './event-notification.processor';
import { EmailModule } from '../email/email.module';
import { TicketsModule } from '../tickets/tickets.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'event-notifications',
      defaultJobOptions: {
        removeOnComplete: 10,
        removeOnFail: 5,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    }),
    EmailModule,
    forwardRef(() => TicketsModule),
  ],
  providers: [EventNotificationService, EventNotificationProcessor],
  exports: [EventNotificationService],
})
export class NotificationsModule {}
