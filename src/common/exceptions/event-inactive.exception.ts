import { BadRequestException } from '@nestjs/common';

export class EventInactiveException extends BadRequestException {
  constructor(eventId: string) {
    super(`Event with ID ${eventId} is not active`);
  }
}
