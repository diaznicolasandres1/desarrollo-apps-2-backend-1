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
      throw new EventNotFoundException(eventId);
    }

    if (!event.isActive) {
      throw new EventInactiveException(eventId);
    }

    return event;
  }

  /**
   * Valida que un tipo de ticket específico esté disponible y activo
   */
  validateTicketTypeAvailability(event: any, ticketType: string): void {
    const ticketTypeData = event.ticketTypes.find((tt: any) => tt.type === ticketType);
    if (!ticketTypeData) {
      throw new BadRequestException(`Ticket type ${ticketType} not available for this event`);
    }

    if (!ticketTypeData.isActive) {
      throw new BadRequestException(`Ticket type ${ticketType} is not active for this event`);
    }
  }

  async checkTicketAvailability(eventId: string, ticketType: string, quantity: number): Promise<boolean> {
    const event = await this.validateEventForTicketPurchase(eventId);
    
    this.validateTicketTypeAvailability(event, ticketType);

    const ticketTypeData = event.ticketTypes.find((tt: any) => tt.type === ticketType)!;
    const availableQuantity = ticketTypeData.initialQuantity - ticketTypeData.soldQuantity;
    
    return availableQuantity >= quantity;
  }

  async getTicketAvailability(eventId: string, ticketType: string): Promise<number> {
    const event = await this.validateEventForTicketPurchase(eventId);
    
    this.validateTicketTypeAvailability(event, ticketType);

    const ticketTypeData = event.ticketTypes.find((tt: any) => tt.type === ticketType)!;
    return ticketTypeData.initialQuantity - ticketTypeData.soldQuantity;
  }

  async updateTicketCount(eventId: string, ticketType: string, quantity: number): Promise<void> {
    const result = await this.repository.updateTicketCount(eventId, ticketType, quantity);

    if (!result) {
      throw new BadRequestException(`Failed to update ticket count for event ${eventId}, type ${ticketType}`);
    }
  }
}
