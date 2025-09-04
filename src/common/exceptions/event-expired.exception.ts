import { BadRequestException } from '@nestjs/common';

export class EventExpiredException extends BadRequestException {
  constructor(eventId: string, eventDate: Date) {
    super(`Event with ID ${eventId} has already passed (date: ${eventDate.toISOString().split('T')[0]})`);
  }
}
