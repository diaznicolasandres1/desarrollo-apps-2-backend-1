import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { Ticket, TicketSchema } from './schemas/ticket.schema';
import { TICKET_REPOSITORY } from './interfaces/ticket.repository.token';
import { MongoDBTicketRepository } from './repositories/mongodb-ticket.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Ticket.name, schema: TicketSchema }
    ])
  ],
  controllers: [TicketsController],
  providers: [
    TicketsService,
    {
      provide: TICKET_REPOSITORY,
      useClass: MongoDBTicketRepository,
    },
  ],
  exports: [TicketsService],
})
export class TicketsModule {}
