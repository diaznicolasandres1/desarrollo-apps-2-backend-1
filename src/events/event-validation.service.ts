import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { EventInactiveException } from '../common/exceptions/event-inactive.exception';
import { EventExpiredException } from '../common/exceptions/event-expired.exception';
import type { EventRepository } from './interfaces/event.repository.interface';
import { EVENT_REPOSITORY } from './interfaces/event.repository.token';
import { Types } from 'mongoose';

@Injectable()
export class EventValidationService {
  constructor(
    @Inject(EVENT_REPOSITORY) private readonly repository: EventRepository
  ) {}

  async validateEventForTicketPurchase(eventId: string): Promise<any> {
    const event = await this.repository.findById(eventId);
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (!event.isActive) {
      throw new EventInactiveException(eventId);
    }

    const now = new Date();
    const eventDate = new Date(event.date);
    if (eventDate <= now) {
      throw new EventExpiredException(eventId, eventDate);
    }

    return event;
  }

  async checkTicketAvailability(eventId: string, ticketType: string, quantity: number): Promise<boolean> {
    const event = await this.repository.findById(eventId);
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const ticketTypeData = event.ticketTypes.find(tt => tt.type === ticketType);
    if (!ticketTypeData) {
      throw new BadRequestException(`Ticket type ${ticketType} not found for this event`);
    }

    return ticketTypeData.soldQuantity + quantity <= ticketTypeData.initialQuantity;
  }

  async getTicketAvailability(eventId: string, ticketType: string): Promise<number> {
    const event = await this.repository.findById(eventId);
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const ticketTypeData = event.ticketTypes.find(tt => tt.type === ticketType);
    if (!ticketTypeData) {
      throw new BadRequestException(`Ticket type ${ticketType} not found for this event`);
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
