import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { Event, EventSchema } from './schemas/event.schema';
import { EVENT_REPOSITORY } from './interfaces/event.repository.token';
import { MongoDBEventRepository } from './repositories/mongodb-event.repository';
import { NotificationsModule } from '../notifications/notifications.module';

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
    {
      provide: EVENT_REPOSITORY,
      useClass: MongoDBEventRepository,
    },
  ],
  exports: [EventsService],
})
export class EventsModule {}
