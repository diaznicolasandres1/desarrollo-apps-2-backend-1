import { Event } from '../schemas/event.schema';

export interface EventRepository {
  create(event: Partial<Event>): Promise<Event>;
  findAll(query?: any): Promise<Event[]>;
  findById(id: string): Promise<Event | null>;
  findByCulturalPlace(culturalPlaceId: string): Promise<Event[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<Event[]>;
  findActiveEvents(): Promise<Event[]>;
  update(id: string, event: Partial<Event>): Promise<Event | null>;
  delete(id: string): Promise<boolean>;
  toggleActive(id: string): Promise<Event | null>;
  updateTicketCount(eventId: string, ticketType: string, quantity: number): Promise<boolean>;
}
