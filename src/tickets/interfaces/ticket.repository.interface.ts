import { Ticket } from '../schemas/ticket.schema';

export interface TicketRepository {
  create(ticket: Partial<Ticket>): Promise<Ticket>;
  findAll(query?: any): Promise<Ticket[]>;
  findById(id: string): Promise<Ticket | null>;
  findByEvent(eventId: string): Promise<Ticket[]>;
  findByUser(userId: string, options?: any): Promise<Ticket[]>;
  findByEventAndUser(eventId: string, userId: string): Promise<Ticket[]>;
  findByStatus(status: string): Promise<Ticket[]>;
  findActiveTickets(): Promise<Ticket[]>;
  update(id: string, ticket: Partial<Ticket>): Promise<Ticket | null>;
  delete(id: string): Promise<boolean>;
  markAsUsed(id: string): Promise<Ticket | null>;
  cancelTicket(id: string, reason?: string): Promise<Ticket | null>;
  countByEventAndType(eventId: string, ticketType: string): Promise<number>;
}
