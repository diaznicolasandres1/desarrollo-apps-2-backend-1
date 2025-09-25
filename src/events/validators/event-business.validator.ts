import { Injectable, BadRequestException } from '@nestjs/common';
import { EventNotFoundException } from '../../common/exceptions/event-not-found.exception';
import { EventInactiveException } from '../../common/exceptions/event-inactive.exception';
import type { EventRepository } from '../interfaces/event.repository.interface';

@Injectable()
export class EventBusinessValidator {
  constructor(
    private readonly repository: EventRepository
  ) {}

  /**
   * Valida que un evento exista y esté activo para compra de tickets
   */
  async validateEventForTicketPurchase(eventId: string): Promise<any> {
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
}
