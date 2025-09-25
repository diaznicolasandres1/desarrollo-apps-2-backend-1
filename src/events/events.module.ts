import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { Event, EventSchema } from './schemas/event.schema';
import { EVENT_REPOSITORY } from './interfaces/event.repository.token';
import { MongoDBEventRepository } from './repositories/mongodb-event.repository';
import { EventInventoryService } from './event-inventory.service';
import { NotificationsModule } from '../notifications/notifications.module';

// Validators
import { EventValidator } from './validators/event.validator';
import { TicketValidator } from './validators/ticket.validator';
import { EventBusinessValidator } from './validators/event-business.validator';

// Transformers
import { EventDataTransformer } from './transformers/event-data.transformer';

// Change Detection
import { EventChangeDetector } from './change-detection/event-change-detector.service';
import { ChangeValueFormatter } from './change-detection/change-value-formatter.service';
import { EventChangeNotifier } from './change-detection/event-change-notifier.service';

// Ticket Management
import { TicketAvailabilityService } from './ticket-management/ticket-availability.service';
import { TicketQuantityService } from './ticket-management/ticket-quantity.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Event.name, schema: EventSchema }
    ]),
    forwardRef(() => NotificationsModule)
  ],
  controllers: [EventsController],
  providers: [
    EventsService,
    EventInventoryService,
    {
      provide: EVENT_REPOSITORY,
      useClass: MongoDBEventRepository,
    },
    // Validators
    EventValidator,
    TicketValidator,
    EventBusinessValidator,
    // Transformers
    EventDataTransformer,
    // Change Detection
    EventChangeDetector,
    ChangeValueFormatter,
    EventChangeNotifier,
    // Ticket Management
    TicketAvailabilityService,
    TicketQuantityService,
  ],
  exports: [EventsService, EventInventoryService],
})
export class EventsModule {}
