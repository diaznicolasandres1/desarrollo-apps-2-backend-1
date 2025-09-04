import { Injectable, NotFoundException, BadRequestException, ConflictException, Inject } from '@nestjs/common';
import { EventNotFoundException } from '../common/exceptions/event-not-found.exception';
import { EventInactiveException } from '../common/exceptions/event-inactive.exception';
import { EventExpiredException } from '../common/exceptions/event-expired.exception';
import type { EventRepository } from './interfaces/event.repository.interface';
import { EVENT_REPOSITORY } from './interfaces/event.repository.token';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Event } from './schemas/event.schema';
import { Types } from 'mongoose';

@Injectable()
export class EventsService {
  constructor(
    @Inject(EVENT_REPOSITORY) private readonly repository: EventRepository
  ) {}

  async create(createEventDto: CreateEventDto): Promise<Event> {
    this.validateEventData(createEventDto);
    
    const eventData = {
      ...createEventDto,
      culturalPlaceId: new Types.ObjectId(createEventDto.culturalPlaceId),
      date: new Date(createEventDto.date),
      ticketTypes: createEventDto.ticketTypes.map(ticketType => ({
        ...ticketType,
        soldQuantity: 0,
        isActive: ticketType.isActive ?? true
      }))
    };

    return this.repository.create(eventData);
  }

  async findAll(query?: any): Promise<Event[]> {
    return this.repository.findAll(query);
  }

  async findOne(id: string): Promise<Event> {
    const event = await this.repository.findById(id);
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  async findByCulturalPlace(culturalPlaceId: string): Promise<Event[]> {
    return this.repository.findByCulturalPlace(culturalPlaceId);
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Event[]> {
    return this.repository.findByDateRange(startDate, endDate);
  }

  async findActiveEvents(): Promise<Event[]> {
    return this.repository.findActiveEvents();
  }

  async update(id: string, updateEventDto: UpdateEventDto): Promise<Event> {
    const event = await this.repository.findById(id);
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (updateEventDto.date) {
      this.validateEventDate(new Date(updateEventDto.date));
    }

    if (updateEventDto.ticketTypes) {
      this.validateTicketTypes(updateEventDto.ticketTypes);
    }

    const updateData: any = {
      ...updateEventDto,
      ...(updateEventDto.date && { date: new Date(updateEventDto.date) })
    };

    if (updateEventDto.culturalPlaceId) {
      updateData.culturalPlaceId = new Types.ObjectId(updateEventDto.culturalPlaceId);
    }

    const updatedEvent = await this.repository.update(id, updateData);

    if (!updatedEvent) {
      throw new NotFoundException('Event not found');
    }

    return updatedEvent;
  }

  async toggleActive(id: string): Promise<Event> {
    const event = await this.repository.toggleActive(id);
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  async remove(id: string): Promise<void> {
    const event = await this.repository.findById(id);
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const deleted = await this.repository.delete(id);
    if (!deleted) {
      throw new NotFoundException('Event not found');
    }
  }

  private validateEventData(createEventDto: CreateEventDto): void {
    this.validateEventDate(new Date(createEventDto.date));
    this.validateTicketTypes(createEventDto.ticketTypes);
    this.validateEventTime(createEventDto.time);
  }

  private validateEventDate(date: Date): void {
    const now = new Date();
    if (date < now) {
      throw new BadRequestException('Event date cannot be in the past');
    }
  }

  private validateTicketTypes(ticketTypes: any[]): void {
    if (!ticketTypes || ticketTypes.length === 0) {
      throw new BadRequestException('At least one ticket type is required');
    }

    const validTypes = ['general', 'vip', 'jubilados', 'niños'];
    const usedTypes = new Set();

    for (const ticketType of ticketTypes) {
      if (!validTypes.includes(ticketType.type)) {
        throw new BadRequestException(`Invalid ticket type: ${ticketType.type}`);
      }

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

  private validateEventTime(time: string): void {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      throw new BadRequestException('Invalid time format. Use HH:MM format');
    }
  }

  async validateEventForTicketPurchase(eventId: string): Promise<Event> {
    const event = await this.repository.findById(eventId);
    if (!event) {
      throw new EventNotFoundException(eventId);
    }

    if (!event.isActive) {
      throw new EventInactiveException(eventId);
    }

    if (event.date < new Date()) {
      throw new EventExpiredException(eventId, event.date);
    }

    return event;
  }

  async checkTicketAvailability(eventId: string, ticketType: string, quantity: number): Promise<boolean> {
    const event = await this.validateEventForTicketPurchase(eventId);
    
    const ticketTypeData = event.ticketTypes.find(tt => tt.type === ticketType);
    if (!ticketTypeData) {
      throw new BadRequestException(`Ticket type ${ticketType} not available for this event`);
    }

    if (!ticketTypeData.isActive) {
      throw new BadRequestException(`Ticket type ${ticketType} is not active for this event`);
    }

    const availableQuantity = ticketTypeData.initialQuantity - ticketTypeData.soldQuantity;
    return availableQuantity >= quantity;
  }

  async getTicketAvailability(eventId: string, ticketType: string): Promise<number> {
    const event = await this.validateEventForTicketPurchase(eventId);
    
    const ticketTypeData = event.ticketTypes.find(tt => tt.type === ticketType);
    if (!ticketTypeData) {
      throw new BadRequestException(`Ticket type ${ticketType} not available for this event`);
    }

    return ticketTypeData.initialQuantity - ticketTypeData.soldQuantity;
  }
}
