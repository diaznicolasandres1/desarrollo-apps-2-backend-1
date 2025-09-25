import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class TicketValidator {
  /**
   * Valida los tipos de tickets para creación de eventos
   */
  validateTicketTypes(ticketTypes: any[]): void {
    if (!ticketTypes || ticketTypes.length === 0) {
      throw new BadRequestException('At least one ticket type is required');
    }

    const usedTypes = new Set();

    for (const ticketType of ticketTypes) {
      if (usedTypes.has(ticketType.type)) {
        throw new BadRequestException(`Duplicate ticket type: ${ticketType.type}`);
      }

      usedTypes.add(ticketType.type);

      if (ticketType.price < 0) {
        throw new BadRequestException('Ticket price cannot be negative');
      }

      if (ticketType.initialQuantity < 1) {
        throw new BadRequestException('Initial quantity must be at least 1');
      }
    }
  }

  /**
   * Valida los tipos de tickets para actualización de eventos (PUT)
   */
  validateTicketTypesPut(ticketTypes: any[]): void {
    if (!ticketTypes || ticketTypes.length === 0) {
      throw new BadRequestException('At least one ticket type is required');
    }

    const usedTypes = new Set();

    for (const ticketType of ticketTypes) {
      // Validar duplicados (sin restricción de tipos válidos)
      if (usedTypes.has(ticketType.type)) {
        throw new BadRequestException(`Duplicate ticket type: ${ticketType.type}`);
      }
      usedTypes.add(ticketType.type);

      // Validar precios
      if (ticketType.price < 0) {
        throw new BadRequestException('Ticket price cannot be negative');
      }

      // Validar cantidades
      if (ticketType.initialQuantity < 1) {
        throw new BadRequestException('Initial quantity must be at least 1');
      }

      if (ticketType.soldQuantity < 0) {
        throw new BadRequestException('Sold quantity cannot be negative');
      }

      // Validar integridad
      if (ticketType.soldQuantity > ticketType.initialQuantity) {
        throw new BadRequestException('Sold quantity cannot exceed initial quantity');
      }
    }
  }
}
