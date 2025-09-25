import { Injectable, BadRequestException } from '@nestjs/common';
import { EventBusinessValidator } from '../validators/event-business.validator';

@Injectable()
export class TicketAvailabilityService {
  constructor(
    private readonly eventBusinessValidator: EventBusinessValidator
  ) {}

  /**
   * Verifica si hay disponibilidad de tickets para un evento
   */
  async checkTicketAvailability(eventId: string, ticketType: string, quantity: number): Promise<boolean> {
    const event = await this.eventBusinessValidator.validateEventForTicketPurchase(eventId);
    
    this.eventBusinessValidator.validateTicketTypeAvailability(event, ticketType);

    const ticketTypeData = event.ticketTypes.find((tt: any) => tt.type === ticketType);
    const availableQuantity = ticketTypeData.initialQuantity - ticketTypeData.soldQuantity;
    
    return availableQuantity >= quantity;
  }

  /**
   * Obtiene la cantidad disponible de tickets para un tipo específico
   */
  async getTicketAvailability(eventId: string, ticketType: string): Promise<number> {
    const event = await this.eventBusinessValidator.validateEventForTicketPurchase(eventId);
    
    this.eventBusinessValidator.validateTicketTypeAvailability(event, ticketType);

    const ticketTypeData = event.ticketTypes.find((tt: any) => tt.type === ticketType);
    return ticketTypeData.initialQuantity - ticketTypeData.soldQuantity;
  }
}
