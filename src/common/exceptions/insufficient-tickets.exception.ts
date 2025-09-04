import { BadRequestException } from '@nestjs/common';

export class InsufficientTicketsException extends BadRequestException {
  constructor(eventId: string, ticketType: string, requested: number, available: number) {
    super(`Insufficient tickets for event ${eventId}, type ${ticketType}. Requested: ${requested}, Available: ${available}`);
  }
}
