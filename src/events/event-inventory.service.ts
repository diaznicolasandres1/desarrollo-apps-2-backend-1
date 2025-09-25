import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { EventNotFoundException } from '../common/exceptions/event-not-found.exception';
import { EventInactiveException } from '../common/exceptions/event-inactive.exception';
import type { EventRepository } from './interfaces/event.repository.interface';
import { EVENT_REPOSITORY } from './interfaces/event.repository.token';
import { Event } from './schemas/event.schema';

@Injectable()
export class EventInventoryService {
  constructor(
    @Inject(EVENT_REPOSITORY) private readonly repository: EventRepository,
  ) {}

  async validateEventForTicketPurchase(eventId: string): Promise<Event> {
    const event = await this.repository.findById(eventId);
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (!event.isActive) {
      throw new EventInactiveException(eventId);
    }

    return event;
  }

  async checkTicketAvailability(eventId: string, ticketType: string, quantity: number): Promise<boolean> {
    const event = await this.repository.findById(eventId);
    if (!event) {
      throw new EventNotFoundException(eventId);
    }

    const ticketTypeData = event.ticketTypes.find(tt => tt.type === ticketType);
    if (!ticketTypeData || !ticketTypeData.isActive) {
      return false;
    }

    return (ticketTypeData.initialQuantity - ticketTypeData.soldQuantity) >= quantity;
  }

  async getTicketAvailability(eventId: string, ticketType: string): Promise<number> {
    const event = await this.repository.findById(eventId);
    if (!event) {
      throw new EventNotFoundException(eventId);
    }

    const ticketTypeData = event.ticketTypes.find(tt => tt.type === ticketType);
    if (!ticketTypeData || !ticketTypeData.isActive) {
      return 0;
    }

    return ticketTypeData.initialQuantity - ticketTypeData.soldQuantity;
  }

  async updateTicketCount(eventId: string, ticketType: string, quantity: number): Promise<void> {
    const result = await this.repository.updateTicketCount(eventId, ticketType, quantity);

    if (!result) {
      throw new BadRequestException(`Failed to update ticket count for event ${eventId}, type ${ticketType}`);
    }
  }
}
