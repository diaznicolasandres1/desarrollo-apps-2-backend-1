import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import type { TicketRepository } from './interfaces/ticket.repository.interface';
import { TICKET_REPOSITORY } from './interfaces/ticket.repository.token';
import { PurchaseTicketDto } from './dto/purchase-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { Ticket } from './schemas/ticket.schema';
import { Types } from 'mongoose';

@Injectable()
export class TicketsService {
  constructor(
    @Inject(TICKET_REPOSITORY) private readonly repository: TicketRepository
  ) {}



  async purchaseTicket(purchaseTicketDto: PurchaseTicketDto): Promise<Ticket[]> {
    const { eventId, userId, ticketType, quantity = 1 } = purchaseTicketDto;

    // Validate quantity
    if (quantity < 1 || quantity > 10) {
      throw new BadRequestException('Quantity must be between 1 and 10');
    }

    // Check availability (this would need to be implemented with Event service)
    // For now, we'll assume availability and create tickets
    const tickets: Ticket[] = [];

    for (let i = 0; i < quantity; i++) {
      const ticketData: Partial<Ticket> = {
        eventId: new Types.ObjectId(eventId),
        userId: new Types.ObjectId(userId),
        ticketType,
        price: this.getTicketPrice(ticketType), // This would come from Event
        status: 'active'
      };
      
      const ticket = await this.repository.create(ticketData);
      tickets.push(ticket);
    }

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

  private getTicketPrice(ticketType: string): number {
    // This would typically come from the Event's ticketTypes
    const prices = {
      general: 1000,
      vip: 2000,
      jubilados: 500,
      niños: 500
    };
    return prices[ticketType] || 1000;
  }
}
