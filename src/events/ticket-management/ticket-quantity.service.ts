import { Injectable, BadRequestException } from '@nestjs/common';
import type { EventRepository } from '../interfaces/event.repository.interface';

@Injectable()
export class TicketQuantityService {
  constructor(
    private readonly repository: EventRepository
  ) {}

  /**
   * Actualiza la cantidad de tickets vendidos para un evento
   */
  async updateTicketCount(eventId: string, ticketType: string, quantity: number): Promise<void> {
    const result = await this.repository.updateTicketCount(eventId, ticketType, quantity);
    
    if (!result) {
      throw new BadRequestException(`Failed to update ticket count for event ${eventId}, type ${ticketType}`);
    }
  }
}
