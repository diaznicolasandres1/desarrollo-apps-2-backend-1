import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { Ticket, TicketSchema } from './schemas/ticket.schema';
import { TICKET_REPOSITORY } from './interfaces/ticket.repository.token';
import { MongoDBTicketRepository } from './repositories/mongodb-ticket.repository';
import { EmailModule } from '../email/email.module';
import { UsersModule } from '../users/users.module';
import { EventValidationService } from '../events/event-validation.service';
import { EVENT_REPOSITORY } from '../events/interfaces/event.repository.token';
import { MongoDBEventRepository } from '../events/repositories/mongodb-event.repository';
import { Event, EventSchema } from '../events/schemas/event.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Ticket.name, schema: TicketSchema },
      { name: Event.name, schema: EventSchema }
    ]),
    EmailModule,
    UsersModule
  ],
  controllers: [TicketsController],
  providers: [
    TicketsService,
    EventValidationService,
    {
      provide: TICKET_REPOSITORY,
      useClass: MongoDBTicketRepository,
    },
    {
      provide: EVENT_REPOSITORY,
      useClass: MongoDBEventRepository,
    },
  ],
  exports: [TicketsService],
})
export class TicketsModule {}
