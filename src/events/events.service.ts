import { Injectable, NotFoundException, Inject, Logger } from '@nestjs/common';
import type { EventRepository } from './interfaces/event.repository.interface';
import { EVENT_REPOSITORY } from './interfaces/event.repository.token';
import { CreateEventDto } from './dto/create-event.dto';
import { PutEventDto } from './dto/put-event.dto';
import { Event } from './schemas/event.schema';

// Validators
import { EventValidator } from './validators/event.validator';
import { TicketValidator } from './validators/ticket.validator';
import { EventBusinessValidator } from './validators/event-business.validator';

// Transformers
import { EventDataTransformer } from './transformers/event-data.transformer';

// Change Detection
import { EventChangeNotifier } from './change-detection/event-change-notifier.service';

// Ticket Management
import { TicketAvailabilityService } from './ticket-management/ticket-availability.service';
import { TicketQuantityService } from './ticket-management/ticket-quantity.service';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    @Inject(EVENT_REPOSITORY) private readonly repository: EventRepository,
    private readonly eventValidator: EventValidator,
    private readonly ticketValidator: TicketValidator,
    private readonly eventBusinessValidator: EventBusinessValidator,
    private readonly eventDataTransformer: EventDataTransformer,
    private readonly eventChangeNotifier: EventChangeNotifier,
    private readonly ticketAvailabilityService: TicketAvailabilityService,
    private readonly ticketQuantityService: TicketQuantityService
  ) {}

  async create(createEventDto: CreateEventDto): Promise<Event> {
    // Validar datos del evento
    this.eventValidator.validateEventData(createEventDto);
    this.ticketValidator.validateTicketTypes(createEventDto.ticketTypes);
    
    // Transformar datos para la creación
    const eventData = this.eventDataTransformer.transformCreateEventData(createEventDto);

    return this.repository.create(eventData);
  }

  async findAll(query?: any): Promise<any[]> {
    const events = await this.repository.findAll(query);
    return this.eventDataTransformer.transformEventsCoordinates(events);
  }

  async findOne(id: string): Promise<any> {
    const event = await this.repository.findById(id);
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return this.eventDataTransformer.transformEventCoordinates(event);
  }

  async findByCulturalPlace(culturalPlaceId: string): Promise<any[]> {
    const events = await this.repository.findByCulturalPlace(culturalPlaceId);
    return this.eventDataTransformer.transformEventsCoordinates(events);
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<any[]> {
    const events = await this.repository.findByDateRange(startDate, endDate);
    return this.eventDataTransformer.transformEventsCoordinates(events);
  }

  async findActiveEvents(): Promise<Event[]> {
    const events = await this.repository.findActiveEvents();
    return this.eventDataTransformer.transformEventsCoordinates(events);
  }

  async update(id: string, putEventDto: PutEventDto): Promise<Event> {
    const originalEvent = await this.repository.findById(id);
    if (!originalEvent) {
      throw new NotFoundException('Event not found');
    }

    // Validar fecha (obligatoria en PUT)
    this.eventValidator.validateEventDate(new Date(putEventDto.date));

    // Validar tipos de tickets (obligatorio en PUT)
    this.ticketValidator.validateTicketTypesPut(putEventDto.ticketTypes);

    // Preparar datos de actualización - solo los campos editables
    const updateData: any = {
      name: putEventDto.name,
      description: putEventDto.description,
      date: new Date(putEventDto.date),
      time: putEventDto.time,
      isActive: putEventDto.isActive,
      ticketTypes: putEventDto.ticketTypes
      // NO incluir image, culturalPlaceId ni otros campos para preservarlos del evento original
    };

    const updatedEvent = await this.repository.update(id, updateData);

    if (!updatedEvent) {
      throw new NotFoundException('Event not found');
    }

    // Notificar cambios si los hay
    await this.eventChangeNotifier.notifyEventChange(id, originalEvent, updateData, updatedEvent);

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

    // Notificar cambios de estado si los hay
    await this.eventChangeNotifier.notifyStatusChange(id, originalEvent, event);

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

  // Métodos de gestión de tickets delegados a servicios especializados
  async validateEventForTicketPurchase(eventId: string): Promise<Event> {
    return this.eventBusinessValidator.validateEventForTicketPurchase(eventId);
  }

  async checkTicketAvailability(eventId: string, ticketType: string, quantity: number): Promise<boolean> {
    return this.ticketAvailabilityService.checkTicketAvailability(eventId, ticketType, quantity);
  }

  async getTicketAvailability(eventId: string, ticketType: string): Promise<number> {
    return this.ticketAvailabilityService.getTicketAvailability(eventId, ticketType);
  }

  async updateTicketCount(eventId: string, ticketType: string, quantity: number): Promise<void> {
    return this.ticketQuantityService.updateTicketCount(eventId, ticketType, quantity);
  }
}
