import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { InsufficientTicketsException } from '../common/exceptions/insufficient-tickets.exception';
import type { TicketRepository } from './interfaces/ticket.repository.interface';
import { TICKET_REPOSITORY } from './interfaces/ticket.repository.token';
import { PurchaseTicketDto } from './dto/purchase-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { Ticket } from './schemas/ticket.schema';
import { Types } from 'mongoose';
import { EventsService } from '../events/events.service';

@Injectable()
export class TicketsService {
  constructor(
    @Inject(TICKET_REPOSITORY) private readonly repository: TicketRepository,
    private readonly eventsService: EventsService
  ) {}



  async purchaseTicket(purchaseTicketDto: PurchaseTicketDto): Promise<Ticket[]> {
    const { eventId, userId, ticketType, quantity = 1 } = purchaseTicketDto;

    // Validate quantity
    if (quantity < 1 || quantity > 10) {
      throw new BadRequestException('Quantity must be between 1 and 10');
    }

    // Validate event exists, is active, and not expired
    const event = await this.eventsService.validateEventForTicketPurchase(eventId);

    // Check ticket availability
    const isAvailable = await this.eventsService.checkTicketAvailability(eventId, ticketType, quantity);
    if (!isAvailable) {
      const availableQuantity = await this.eventsService.getTicketAvailability(eventId, ticketType);
      throw new InsufficientTicketsException(eventId, ticketType, quantity, availableQuantity);
    }

    // Get ticket price from event
    const ticketTypeData = event.ticketTypes.find(tt => tt.type === ticketType);
    if (!ticketTypeData) {
      throw new BadRequestException(`Ticket type ${ticketType} not available for this event`);
    }
    const ticketPrice = ticketTypeData.price;

    const tickets: Ticket[] = [];

    for (let i = 0; i < quantity; i++) {
      const ticketData: Partial<Ticket> = {
        eventId: new Types.ObjectId(eventId),
        userId: new Types.ObjectId(userId),
        ticketType,
        price: ticketPrice,
        status: 'active'
      };
      
      const ticket = await this.repository.create(ticketData);
      tickets.push(ticket);
    }
ino 
    // Update ticket count in event
    await this.eventsService.updateTicketCount(eventId, ticketType, quantity);

    return tickets;
  }

  async findAll(query?: any): Promise<Ticket[]> {
    return this.repository.findAll(query);
  }

  async findOne(id: string): Promise<Ticket> {
    const ticket = await this.repository.findById(id);
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }
    return ticket;
  }

  async findByEvent(eventId: string): Promise<Ticket[]> {
    return this.repository.findByEvent(eventId);
  }

  async findByUser(userId: string): Promise<Ticket[]> {
    return this.repository.findByUser(userId);
  }

  async findByEventAndUser(eventId: string, userId: string): Promise<Ticket[]> {
    return this.repository.findByEventAndUser(eventId, userId);
  }

  async findByStatus(status: string): Promise<Ticket[]> {
    return this.repository.findByStatus(status);
  }

  async findActiveTickets(): Promise<Ticket[]> {
    return this.repository.findActiveTickets();
  }

  async update(id: string, updateTicketDto: UpdateTicketDto): Promise<Ticket> {
    const ticket = await this.repository.findById(id);
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    const updateData: any = {
      ...updateTicketDto,
      ...(updateTicketDto.eventId && { eventId: new Types.ObjectId(updateTicketDto.eventId) }),
      ...(updateTicketDto.userId && { userId: new Types.ObjectId(updateTicketDto.userId) })
    };

    const updatedTicket = await this.repository.update(id, updateData);
    if (!updatedTicket) {
      throw new NotFoundException('Ticket not found');
    }

    return updatedTicket;
  }

  async markAsUsed(id: string): Promise<Ticket> {
    const ticket = await this.repository.findById(id);
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (ticket.status !== 'active') {
      throw new BadRequestException('Ticket is not active');
    }

    const updatedTicket = await this.repository.markAsUsed(id);
    if (!updatedTicket) {
      throw new NotFoundException('Ticket not found');
    }

    return updatedTicket;
  }

  async cancelTicket(id: string, reason?: string): Promise<Ticket> {
    const ticket = await this.repository.findById(id);
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (ticket.status !== 'active') {
      throw new BadRequestException('Ticket is not active');
    }

    const updatedTicket = await this.repository.cancelTicket(id, reason);
    if (!updatedTicket) {
      throw new NotFoundException('Ticket not found');
    }

    return updatedTicket;
  }

  async remove(id: string): Promise<void> {
    const ticket = await this.repository.findById(id);
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    const deleted = await this.repository.delete(id);
    if (!deleted) {
      throw new NotFoundException('Ticket not found');
    }
  }

  async getTicketStats(eventId: string): Promise<any> {
    const tickets = await this.repository.findByEvent(eventId);
    
    const stats = {
      total: tickets.length,
      active: tickets.filter(t => t.status === 'active').length,
      used: tickets.filter(t => t.status === 'used').length,
      cancelled: tickets.filter(t => t.status === 'cancelled').length,
      byType: {
        general: tickets.filter(t => t.ticketType === 'general').length,
        vip: tickets.filter(t => t.ticketType === 'vip').length,
        jubilados: tickets.filter(t => t.ticketType === 'jubilados').length,
        niños: tickets.filter(t => t.ticketType === 'niños').length,
      }
    };

    return stats;
  }

}
