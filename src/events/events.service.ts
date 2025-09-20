import { Injectable, NotFoundException, BadRequestException, ConflictException, Inject, Logger } from '@nestjs/common';
import { EventNotFoundException } from '../common/exceptions/event-not-found.exception';
import { EventInactiveException } from '../common/exceptions/event-inactive.exception';
import { EventExpiredException } from '../common/exceptions/event-expired.exception';
import type { EventRepository } from './interfaces/event.repository.interface';
import { EVENT_REPOSITORY } from './interfaces/event.repository.token';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Event } from './schemas/event.schema';
import { EventWithCulturalPlace } from './interfaces/event-with-cultural-place.interface';
import { Types } from 'mongoose';
import { EventNotificationService } from '../notifications/event-notification.service';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    @Inject(EVENT_REPOSITORY) private readonly repository: EventRepository,
    private readonly eventNotificationService: EventNotificationService
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

  async findAll(query?: any): Promise<any[]> {
    const events = await this.repository.findAll(query);
    return events.map(event => this.transformEventCoordinates((event as any).toObject ? (event as any).toObject() : event));
  }

  async findOne(id: string): Promise<any> {
    const event = await this.repository.findById(id);
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return this.transformEventCoordinates((event as any).toObject ? (event as any).toObject() : event);
  }

  async findByCulturalPlace(culturalPlaceId: string): Promise<any[]> {
    const events = await this.repository.findByCulturalPlace(culturalPlaceId);
    return events.map(event => this.transformEventCoordinates((event as any).toObject ? (event as any).toObject() : event));
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<any[]> {
    const events = await this.repository.findByDateRange(startDate, endDate);
    return events.map(event => this.transformEventCoordinates((event as any).toObject ? (event as any).toObject() : event));
  }

  async findActiveEvents(): Promise<Event[]> {
    const events = await this.repository.findActiveEvents();
    return events.map(event => this.transformEventCoordinates((event as any).toObject ? (event as any).toObject() : event));
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

    // Detectar cambios críticos antes de actualizar
    const changeType = this.detectCriticalChange(event, updateData);
    
    const updatedEvent = await this.repository.update(id, updateData);

    if (!updatedEvent) {
      throw new NotFoundException('Event not found');
    }

    // Publicar al tópico si hay cambio crítico
    if (changeType) {
      try {
        await this.eventNotificationService.publishEventChange({
          event: updatedEvent,
          changeType: changeType,
        });
      } catch (error) {
        this.logger.error('Error publicando evento de cambio:', error);
        // No lanzamos el error para no interrumpir la actualización del evento
      }
    }

    return updatedEvent;
  }

  async toggleActive(id: string): Promise<Event> {
    const originalEvent = await this.repository.findById(id);
    if (!originalEvent) {
      throw new NotFoundException('Event not found');
    }

    const event = await this.repository.toggleActive(id);
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Detectar si cambió el estado activo
    const changeType = originalEvent.isActive !== event.isActive 
      ? (event.isActive ? 'activation' : 'cancellation')
      : null;

    // Publicar al tópico si hay cambio de estado
    if (changeType) {
      try {
        await this.eventNotificationService.publishEventChange({
          event: event,
          changeType: changeType,
        });
      } catch (error) {
        this.logger.error('Error publicando evento de cambio de estado:', error);
        // No lanzamos el error para no interrumpir la actualización del evento
      }
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

  /**
   * Transforma las coordenadas GeoJSON del lugar cultural a formato {lat, lng} para mantener compatibilidad con el frontend
   */
  private transformEventCoordinates(event: any): any {
    if (event && event.culturalPlaceId && event.culturalPlaceId.contact && event.culturalPlaceId.contact.coordinates) {
      const coordinates = event.culturalPlaceId.contact.coordinates;
      
      // Si ya está en formato {lat, lng}, devolverlo tal como está
      if (coordinates.lat !== undefined && coordinates.lng !== undefined) {
        return event;
      }
      
      // Si está en formato GeoJSON, convertir a {lat, lng}
      if (coordinates.type === 'Point' && Array.isArray(coordinates.coordinates)) {
        return {
          ...event,
          culturalPlaceId: {
            ...event.culturalPlaceId,
            contact: {
              ...event.culturalPlaceId.contact,
              coordinates: {
                lat: coordinates.coordinates[1], // lat es el segundo elemento
                lng: coordinates.coordinates[0]  // lng es el primer elemento
              }
            }
          }
        };
      }
    }
    
    return event;
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

  async updateTicketCount(eventId: string, ticketType: string, quantity: number): Promise<void> {
    const result = await this.repository.updateTicketCount(eventId, ticketType, quantity);
    
    if (!result) {
      throw new BadRequestException(`Failed to update ticket count for event ${eventId}, type ${ticketType}`);
    }
  }

  private detectCriticalChange(originalEvent: any, updateData: any): 'location_change' | 'date_change' | 'time_change' | null {
    // Cambio de lugar cultural
    if (updateData.culturalPlaceId && updateData.culturalPlaceId.toString() !== originalEvent.culturalPlaceId.toString()) {
      return 'location_change';
    }

    // Cambio de fecha
    if (updateData.date && new Date(updateData.date).getTime() !== new Date(originalEvent.date).getTime()) {
      return 'date_change';
    }

    // Cambio de hora
    if (updateData.time && updateData.time !== originalEvent.time) {
      return 'time_change';
    }

    return null;
  }
}
