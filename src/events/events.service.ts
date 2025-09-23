import { Injectable, NotFoundException, BadRequestException, ConflictException, Inject, Logger } from '@nestjs/common';
import { EventNotFoundException } from '../common/exceptions/event-not-found.exception';
import { EventInactiveException } from '../common/exceptions/event-inactive.exception';
import { EventExpiredException } from '../common/exceptions/event-expired.exception';
import type { EventRepository } from './interfaces/event.repository.interface';
import { EVENT_REPOSITORY } from './interfaces/event.repository.token';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { PutEventDto } from './dto/put-event.dto';
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

  async update(id: string, putEventDto: PutEventDto): Promise<Event> {
    const originalEvent = await this.repository.findById(id);
    if (!originalEvent) {
      throw new NotFoundException('Event not found');
    }

    // Validar fecha (obligatoria en PUT)
    this.validateEventDate(new Date(putEventDto.date));

    // Validar tipos de tickets (obligatorio en PUT)
    this.validateTicketTypesPut(putEventDto.ticketTypes);

    // Preparar datos de actualización preservando campos no editables
    const updateData: any = {
      name: putEventDto.name,
      description: putEventDto.description,
      date: new Date(putEventDto.date),
      time: putEventDto.time,
      isActive: putEventDto.isActive,
      ticketTypes: putEventDto.ticketTypes,
      // Preservar culturalPlaceId del evento original (no editable en PUT)
      culturalPlaceId: originalEvent.culturalPlaceId,
      // Manejar imagen opcional
      ...(putEventDto.image && { image: putEventDto.image })
    };

    const changeType = this.detectCriticalChange(originalEvent, updateData);

    const updatedEvent = await this.repository.update(id, updateData);

    if (!updatedEvent) {
      throw new NotFoundException('Event not found');
    }

    if (changeType) {
      try {
        // Para location_change, necesitamos obtener los nombres de los lugares culturales
        let oldValue, newValue;
        if (changeType === 'location_change') {
          // Obtener el evento actualizado con populate para tener los nombres
          const updatedEventWithPopulate = await this.repository.findById(id);
          oldValue = originalEvent.culturalPlaceId?.name || 'N/A';
          newValue = updatedEventWithPopulate?.culturalPlaceId?.name || 'N/A';
        } else {
          const changeValues = await this.getChangeValues(originalEvent, updatedEvent, changeType);
          oldValue = changeValues.oldValue;
          newValue = changeValues.newValue;
        }
        
        await this.eventNotificationService.publishEventChange({
          event: updatedEvent,
          changeType: changeType,
          oldValue,
          newValue,
        });
      } catch (error) {
        this.logger.error(`Error publishing event modification for event ${id}:`, error);
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
        const { oldValue, newValue } = await this.getChangeValues(originalEvent, event, changeType);
        await this.eventNotificationService.publishEventChange({
          event: event,
          changeType: changeType,
          oldValue,
          newValue,
        });
      } catch (error) {
        this.logger.error(`Error publishing event status change for event ${id}:`, error);
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

  private detectCriticalChange(originalEvent: any, updateData: any): 'location_change' | 'date_change' | 'time_change' | 'date_time_change' | null {
    // Cambio de lugar cultural
    if (updateData.culturalPlaceId && updateData.culturalPlaceId.toString() !== originalEvent.culturalPlaceId.toString()) {
      return 'location_change';
    }

    // Verificar cambios en fecha y hora
    const dateChanged = updateData.date && new Date(updateData.date).getTime() !== new Date(originalEvent.date).getTime();
    const timeChanged = updateData.time && updateData.time !== originalEvent.time;

    // Si cambian ambos, es un cambio de fecha y hora
    if (dateChanged && timeChanged) {
      return 'date_time_change';
    }

    // Si solo cambia la fecha
    if (dateChanged) {
      return 'date_change';
    }

    // Si solo cambia la hora
    if (timeChanged) {
      return 'time_change';
    }

    return null;
  }

  private async getChangeValues(originalEvent: any, updatedEvent: any, changeType: string): Promise<{ oldValue: any; newValue: any }> {
    switch (changeType) {
      case 'location_change':
        // Usar los datos que ya tenemos disponibles
        return {
          oldValue: originalEvent.culturalPlaceId?.name || 'N/A',
          newValue: updatedEvent.culturalPlaceId?.name || 'N/A',
        };
      
      case 'date_change':
        try {
          // Intentar diferentes formatos de fecha
          let originalDate: Date;
          let updatedDate: Date;
          
          // Para originalEvent, puede que sea un string o un objeto Date
          if (originalEvent.date instanceof Date) {
            originalDate = originalEvent.date;
          } else if (typeof originalEvent.date === 'string') {
            originalDate = new Date(originalEvent.date);
          } else {
            originalDate = new Date(originalEvent.date?.toString() || originalEvent.date);
          }
          
          // Para updatedEvent, debería ser un string ISO
          if (updatedEvent.date instanceof Date) {
            updatedDate = updatedEvent.date;
          } else {
            updatedDate = new Date(updatedEvent.date);
          }
          
          return {
            oldValue: isNaN(originalDate.getTime()) ? `Fecha inválida (${originalEvent.date})` : originalDate.toLocaleDateString('es-ES'),
            newValue: isNaN(updatedDate.getTime()) ? `Fecha inválida (${updatedEvent.date})` : updatedDate.toLocaleDateString('es-ES'),
          };
        } catch (error) {
          return {
            oldValue: `Error al formatear fecha original: ${originalEvent.date}`,
            newValue: `Error al formatear fecha nueva: ${updatedEvent.date}`,
          };
        }
      
      case 'date_time_change':
        try {
          // Formatear fecha y hora juntas
          let originalDate: Date;
          let updatedDate: Date;
          
          if (originalEvent.date instanceof Date) {
            originalDate = originalEvent.date;
          } else if (typeof originalEvent.date === 'string') {
            originalDate = new Date(originalEvent.date);
          } else {
            originalDate = new Date(originalEvent.date?.toString() || originalEvent.date);
          }
          
          if (updatedEvent.date instanceof Date) {
            updatedDate = updatedEvent.date;
          } else {
            updatedDate = new Date(updatedEvent.date);
          }
          
          const originalFormatted = isNaN(originalDate.getTime()) 
            ? `Fecha inválida (${originalEvent.date})` 
            : `${originalDate.toLocaleDateString('es-ES')} a las ${originalEvent.time}`;
          
          const updatedFormatted = isNaN(updatedDate.getTime()) 
            ? `Fecha inválida (${updatedEvent.date})` 
            : `${updatedDate.toLocaleDateString('es-ES')} a las ${updatedEvent.time}`;
          
          return {
            oldValue: originalFormatted,
            newValue: updatedFormatted,
          };
        } catch (error) {
          return {
            oldValue: `Error al formatear fecha/hora original: ${originalEvent.date} ${originalEvent.time}`,
            newValue: `Error al formatear fecha/hora nueva: ${updatedEvent.date} ${updatedEvent.time}`,
          };
        }
      
      case 'time_change':
        return {
          oldValue: originalEvent.time || 'N/A',
          newValue: updatedEvent.time || 'N/A',
        };
      
      case 'activation':
        return {
          oldValue: originalEvent.isActive ? 'Activo' : 'Inactivo',
          newValue: updatedEvent.isActive ? 'Activo' : 'Inactivo',
        };
      
      case 'cancellation':
        return {
          oldValue: originalEvent.isActive ? 'Activo' : 'Inactivo',
          newValue: updatedEvent.isActive ? 'Activo' : 'Inactivo',
        };
      
      default:
        return {
          oldValue: 'N/A',
          newValue: 'N/A',
        };
    }
  }

  private validateTicketTypesPut(ticketTypes: any[]): void {
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
