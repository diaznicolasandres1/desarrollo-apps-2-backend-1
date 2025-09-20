import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EventsService } from '../events.service';
import type { EventRepository } from '../interfaces/event.repository.interface';
import { EVENT_REPOSITORY } from '../interfaces/event.repository.token';
import { CreateEventDto } from '../dto/create-event.dto';
import { UpdateEventDto } from '../dto/update-event.dto';
import { EventNotificationService } from '../../notifications/event-notification.service';

describe('EventsService', () => {
  let service: EventsService;
  let repository: jest.Mocked<EventRepository>;
  let eventNotificationService: jest.Mocked<EventNotificationService>;

  const mockEvent: any = {
    _id: '507f1f77bcf86cd799439011',
    culturalPlaceId: {
      _id: '507f1f77bcf86cd799439012',
      name: 'Centro Cultural Raices',
      description: 'Un centro cultural que ofrece servicios de biblioteca, proyecciones de cine y galería de arte',
      category: 'Centro Cultural',
      characteristics: ['Servicios de Biblioteca', 'Proyecciones de Cine', 'Galería de Arte'],
      contact: {
        address: 'Agrelo 3045',
        coordinates: { lat: -34.61724004, lng: -58.40879856 },
        phone: '49316157',
        website: 'https://example.com',
        email: 'info@lugar.com'
      },
      image: 'https://picsum.photos/800/600?random=756',
      rating: 3.3
    },
    name: 'Exposición de Arte Contemporáneo',
    description: 'Una muestra de artistas locales',
    date: new Date('2025-12-25'),
    time: '19:00',
    ticketTypes: [
      {
        type: 'general',
        price: 1000,
        initialQuantity: 100,
        soldQuantity: 0,
        isActive: true,
      },
      {
        type: 'vip',
        price: 2000,
        initialQuantity: 20,
        soldQuantity: 0,
        isActive: true,
      },
    ],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByCulturalPlace: jest.fn(),
    findByDateRange: jest.fn(),
    findActiveEvents: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    toggleActive: jest.fn(),
    updateTicketCount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: EVENT_REPOSITORY,
          useValue: mockRepository,
        },
        {
          provide: EventNotificationService,
          useValue: {
            publishEventChange: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    repository = module.get(EVENT_REPOSITORY);
    eventNotificationService = module.get(EventNotificationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createEventDto: CreateEventDto = {
      culturalPlaceId: '507f1f77bcf86cd799439012',
      name: 'Exposición de Arte Contemporáneo',
      description: 'Una muestra de artistas locales',
      date: '2025-12-25',
      time: '19:00',
      ticketTypes: [
        {
          type: 'general',
          price: 1000,
          initialQuantity: 100,
          isActive: true,
        },
      ],
      isActive: true,
    };

    it('should create an event successfully', async () => {
      repository.create.mockResolvedValue(mockEvent);

      const result = await service.create(createEventDto);

      expect(result).toEqual(mockEvent);
      expect(repository.create).toHaveBeenCalledWith({
        ...createEventDto,
        culturalPlaceId: expect.any(Object),
        date: new Date(createEventDto.date),
        ticketTypes: [
          {
            ...createEventDto.ticketTypes[0],
            soldQuantity: 0,
            isActive: true,
          },
        ],
      });
    });

    it('should throw BadRequestException for past date', async () => {
      const pastDateDto = {
        ...createEventDto,
        date: '2020-01-01',
      };

      await expect(service.create(pastDateDto)).rejects.toThrow(BadRequestException);
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid ticket type', async () => {
      const invalidTicketDto = {
        ...createEventDto,
        ticketTypes: [
          {
            type: 'invalid',
            price: 1000,
            initialQuantity: 100,
          },
        ],
      };

      await expect(service.create(invalidTicketDto)).rejects.toThrow(BadRequestException);
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for duplicate ticket types', async () => {
      const duplicateTicketDto = {
        ...createEventDto,
        ticketTypes: [
          { type: 'general', price: 1000, initialQuantity: 100 },
          { type: 'general', price: 1500, initialQuantity: 50 },
        ],
      };

      await expect(service.create(duplicateTicketDto)).rejects.toThrow(BadRequestException);
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid time format', async () => {
      const invalidTimeDto = {
        ...createEventDto,
        time: '25:00',
      };

      await expect(service.create(invalidTimeDto)).rejects.toThrow(BadRequestException);
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all events', async () => {
      const events = [mockEvent];
      repository.findAll.mockResolvedValue(events);

      const result = await service.findAll();

      expect(result).toEqual(events);
      expect(repository.findAll).toHaveBeenCalledWith(undefined);
    });

    it('should return filtered events', async () => {
      const events = [mockEvent];
      const query = { isActive: true };
      repository.findAll.mockResolvedValue(events);

      const result = await service.findAll(query);

      expect(result).toEqual(events);
      expect(repository.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('should return an event by id', async () => {
      repository.findById.mockResolvedValue(mockEvent);

      const result = await service.findOne('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockEvent);
      expect(repository.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should throw NotFoundException if event not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
      expect(repository.findById).toHaveBeenCalledWith('invalid-id');
    });
  });

  describe('findByCulturalPlace', () => {
    it('should return events for a cultural place', async () => {
      const events = [mockEvent];
      repository.findByCulturalPlace.mockResolvedValue(events);

      const result = await service.findByCulturalPlace('507f1f77bcf86cd799439012');

      expect(result).toEqual(events);
      expect(repository.findByCulturalPlace).toHaveBeenCalledWith('507f1f77bcf86cd799439012');
    });
  });

  describe('findByDateRange', () => {
    it('should return events within date range', async () => {
      const events = [mockEvent];
      const startDate = new Date('2024-12-01');
      const endDate = new Date('2024-12-31');
      repository.findByDateRange.mockResolvedValue(events);

      const result = await service.findByDateRange(startDate, endDate);

      expect(result).toEqual(events);
      expect(repository.findByDateRange).toHaveBeenCalledWith(startDate, endDate);
    });
  });

  describe('findActiveEvents', () => {
    it('should return active events', async () => {
      const events = [mockEvent];
      repository.findActiveEvents.mockResolvedValue(events);

      const result = await service.findActiveEvents();

      expect(result).toEqual(events);
      expect(repository.findActiveEvents).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const updateEventDto: UpdateEventDto = {
      name: 'Exposición Actualizada',
      description: 'Descripción actualizada',
    };

    it('should update an event successfully', async () => {
      const updatedEvent = { ...mockEvent, ...updateEventDto };
      repository.findById.mockResolvedValue(mockEvent);
      repository.update.mockResolvedValue(updatedEvent);

      const result = await service.update('507f1f77bcf86cd799439011', updateEventDto);

      expect(result).toEqual(updatedEvent);
      expect(repository.update).toHaveBeenCalledWith('507f1f77bcf86cd799439011', updateEventDto);
    });

    it('should throw NotFoundException if event not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.update('invalid-id', updateEventDto)).rejects.toThrow(NotFoundException);
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should validate date if provided', async () => {
      const pastDateDto = { date: '2020-01-01' };
      repository.findById.mockResolvedValue(mockEvent);

      await expect(service.update('507f1f77bcf86cd799439011', pastDateDto)).rejects.toThrow(BadRequestException);
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should validate ticket types if provided', async () => {
      const invalidTicketDto = {
        ticketTypes: [
          { type: 'invalid', price: 1000, initialQuantity: 100 },
        ],
      };
      repository.findById.mockResolvedValue(mockEvent);

      await expect(service.update('507f1f77bcf86cd799439011', invalidTicketDto)).rejects.toThrow(BadRequestException);
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should publish event change notification for location change', async () => {
      const originalEvent = {
        ...mockEvent,
        culturalPlaceId: { _id: '507f1f77bcf86cd799439012', name: 'Old Place' }
      };
      const updatedEvent = {
        ...mockEvent,
        culturalPlaceId: { _id: '507f1f77bcf86cd799439013', name: 'New Place' }
      };
      
      repository.findById.mockResolvedValueOnce(originalEvent);
      repository.findById.mockResolvedValueOnce(updatedEvent);
      repository.update.mockResolvedValue(updatedEvent);
      eventNotificationService.publishEventChange.mockResolvedValue(undefined);

      const updateDto = { culturalPlaceId: '507f1f77bcf86cd799439013' };
      const result = await service.update('507f1f77bcf86cd799439011', updateDto, 'location_change');

      expect(result).toEqual(updatedEvent);
      expect(eventNotificationService.publishEventChange).toHaveBeenCalledWith({
        event: updatedEvent,
        changeType: 'location_change',
        oldValue: 'Old Place',
        newValue: 'New Place',
      });
    });

    it('should handle error when publishing event change notification', async () => {
      const originalEvent = {
        ...mockEvent,
        culturalPlaceId: { _id: '507f1f77bcf86cd799439012', name: 'Old Place' }
      };
      const updatedEvent = {
        ...mockEvent,
        culturalPlaceId: { _id: '507f1f77bcf86cd799439013', name: 'New Place' }
      };
      
      repository.findById.mockResolvedValueOnce(originalEvent);
      repository.findById.mockResolvedValueOnce(updatedEvent);
      repository.update.mockResolvedValue(updatedEvent);
      eventNotificationService.publishEventChange.mockRejectedValue(new Error('Notification failed'));

      const updateDto = { culturalPlaceId: '507f1f77bcf86cd799439013' };
      const result = await service.update('507f1f77bcf86cd799439011', updateDto, 'location_change');

      expect(result).toEqual(updatedEvent);
      // Should not throw error, just log it
    });

    it('should publish event change notification for other change types', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      const futureDateStr = futureDate.toISOString().split('T')[0];
      
      const futureDate2 = new Date();
      futureDate2.setDate(futureDate2.getDate() + 31);
      const futureDate2Str = futureDate2.toISOString().split('T')[0];
      
      const originalEvent = { ...mockEvent, date: futureDateStr };
      const updatedEvent = { ...mockEvent, date: futureDate2Str };
      
      repository.findById.mockResolvedValue(originalEvent);
      repository.update.mockResolvedValue(updatedEvent);
      eventNotificationService.publishEventChange.mockResolvedValue(undefined);

      // Mock getChangeValues method
      const getChangeValuesSpy = jest.spyOn(service as any, 'getChangeValues')
        .mockResolvedValue({ oldValue: '25/12/2024', newValue: '26/12/2024' });

      // Use a different date to trigger the change detection
      const updateDto = { date: futureDate2Str };
      const result = await service.update('507f1f77bcf86cd799439011', updateDto, 'date_change');

      expect(result).toEqual(updatedEvent);
      expect(getChangeValuesSpy).toHaveBeenCalledWith(originalEvent, updatedEvent, 'date_change');
      expect(eventNotificationService.publishEventChange).toHaveBeenCalledWith({
        event: updatedEvent,
        changeType: 'date_change',
        oldValue: '25/12/2024',
        newValue: '26/12/2024',
      });

      getChangeValuesSpy.mockRestore();
    });
  });

  describe('toggleActive', () => {
    it('should toggle event active status', async () => {
      const toggledEvent = { ...mockEvent, isActive: false };
      repository.findById.mockResolvedValue(mockEvent);
      repository.toggleActive.mockResolvedValue(toggledEvent);

      const result = await service.toggleActive('507f1f77bcf86cd799439011');

      expect(result).toEqual(toggledEvent);
      expect(repository.toggleActive).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should throw NotFoundException if event not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.toggleActive('invalid-id')).rejects.toThrow(NotFoundException);
    });

    it('should publish activation notification when event becomes active', async () => {
      const inactiveEvent = { ...mockEvent, isActive: false };
      const activatedEvent = { ...mockEvent, isActive: true };
      
      repository.findById.mockResolvedValue(inactiveEvent);
      repository.toggleActive.mockResolvedValue(activatedEvent);
      eventNotificationService.publishEventChange.mockResolvedValue(undefined);

      const result = await service.toggleActive('507f1f77bcf86cd799439011');

      expect(result).toEqual(activatedEvent);
      expect(eventNotificationService.publishEventChange).toHaveBeenCalledWith({
        event: activatedEvent,
        changeType: 'activation',
        oldValue: 'Inactivo',
        newValue: 'Activo',
      });
    });

    it('should publish cancellation notification when event becomes inactive', async () => {
      const activeEvent = { ...mockEvent, isActive: true };
      const cancelledEvent = { ...mockEvent, isActive: false };
      
      repository.findById.mockResolvedValue(activeEvent);
      repository.toggleActive.mockResolvedValue(cancelledEvent);
      eventNotificationService.publishEventChange.mockResolvedValue(undefined);

      const result = await service.toggleActive('507f1f77bcf86cd799439011');

      expect(result).toEqual(cancelledEvent);
      expect(eventNotificationService.publishEventChange).toHaveBeenCalledWith({
        event: cancelledEvent,
        changeType: 'cancellation',
        oldValue: 'Activo',
        newValue: 'Inactivo',
      });
    });

    it('should not publish notification when status does not change', async () => {
      const activeEvent = { ...mockEvent, isActive: true };
      const sameEvent = { ...mockEvent, isActive: true };
      
      repository.findById.mockResolvedValue(activeEvent);
      repository.toggleActive.mockResolvedValue(sameEvent);

      const result = await service.toggleActive('507f1f77bcf86cd799439011');

      expect(result).toEqual(sameEvent);
      expect(eventNotificationService.publishEventChange).not.toHaveBeenCalled();
    });

    it('should handle error when publishing notification fails', async () => {
      const inactiveEvent = { ...mockEvent, isActive: false };
      const activatedEvent = { ...mockEvent, isActive: true };
      
      repository.findById.mockResolvedValue(inactiveEvent);
      repository.toggleActive.mockResolvedValue(activatedEvent);
      eventNotificationService.publishEventChange.mockRejectedValue(new Error('Notification failed'));

      const result = await service.toggleActive('507f1f77bcf86cd799439011');

      expect(result).toEqual(activatedEvent);
      // Should not throw error, just log it
    });
  });

  describe('remove', () => {
    it('should remove an event successfully', async () => {
      repository.findById.mockResolvedValue(mockEvent);
      repository.delete.mockResolvedValue(true);

      await service.remove('507f1f77bcf86cd799439011');

      expect(repository.delete).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should throw NotFoundException if event not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.remove('invalid-id')).rejects.toThrow(NotFoundException);
      expect(repository.delete).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if delete fails', async () => {
      repository.findById.mockResolvedValue(mockEvent);
      repository.delete.mockResolvedValue(false);

      await expect(service.remove('507f1f77bcf86cd799439011')).rejects.toThrow(NotFoundException);
    });
  });

  describe('coordinate transformation', () => {
    it('should transform GeoJSON coordinates to {lat, lng} format in findOne', async () => {
      const eventWithGeoJSONCoordinates = {
        ...mockEvent,
        culturalPlaceId: {
          ...mockEvent.culturalPlaceId,
          contact: {
            ...mockEvent.culturalPlaceId.contact,
            coordinates: {
              type: 'Point',
              coordinates: [-58.40879856, -34.61724004] // [lng, lat]
            }
          }
        }
      };

      repository.findById.mockResolvedValue(eventWithGeoJSONCoordinates);

      const result = await service.findOne('507f1f77bcf86cd799439011');

      expect(result.culturalPlaceId.contact.coordinates).toEqual({
        lat: -34.61724004,
        lng: -58.40879856
      });
    });

    it('should transform GeoJSON coordinates to {lat, lng} format in findAll', async () => {
      const eventsWithGeoJSONCoordinates = [{
        ...mockEvent,
        culturalPlaceId: {
          ...mockEvent.culturalPlaceId,
          contact: {
            ...mockEvent.culturalPlaceId.contact,
            coordinates: {
              type: 'Point',
              coordinates: [-58.40879856, -34.61724004] // [lng, lat]
            }
          }
        }
      }];

      repository.findAll.mockResolvedValue(eventsWithGeoJSONCoordinates);

      const result = await service.findAll();

      expect(result[0].culturalPlaceId.contact.coordinates).toEqual({
        lat: -34.61724004,
        lng: -58.40879856
      });
    });

    it('should transform GeoJSON coordinates to {lat, lng} format in findByCulturalPlace', async () => {
      const eventsWithGeoJSONCoordinates = [{
        ...mockEvent,
        culturalPlaceId: {
          ...mockEvent.culturalPlaceId,
          contact: {
            ...mockEvent.culturalPlaceId.contact,
            coordinates: {
              type: 'Point',
              coordinates: [-58.40879856, -34.61724004] // [lng, lat]
            }
          }
        }
      }];

      repository.findByCulturalPlace.mockResolvedValue(eventsWithGeoJSONCoordinates);

      const result = await service.findByCulturalPlace('507f1f77bcf86cd799439012');

      expect(result[0].culturalPlaceId.contact.coordinates).toEqual({
        lat: -34.61724004,
        lng: -58.40879856
      });
    });

    it('should not transform coordinates if already in {lat, lng} format', async () => {
      const eventWithCorrectFormat = {
        ...mockEvent,
        culturalPlaceId: {
          ...mockEvent.culturalPlaceId,
          contact: {
            ...mockEvent.culturalPlaceId.contact,
            coordinates: {
              lat: -34.61724004,
              lng: -58.40879856
            }
          }
        }
      };

      repository.findById.mockResolvedValue(eventWithCorrectFormat);

      const result = await service.findOne('507f1f77bcf86cd799439011');

      expect(result.culturalPlaceId.contact.coordinates).toEqual({
        lat: -34.61724004,
        lng: -58.40879856
      });
    });

    it('should handle events without cultural place coordinates', async () => {
      const eventWithoutCoordinates = {
        ...mockEvent,
        culturalPlaceId: {
          ...mockEvent.culturalPlaceId,
          contact: {
            address: 'Agrelo 3045',
            phone: '49316157',
            website: 'https://example.com',
            email: 'info@lugar.com'
            // Sin coordenadas
          }
        }
      };

      repository.findById.mockResolvedValue(eventWithoutCoordinates);

      const result = await service.findOne('507f1f77bcf86cd799439011');

      expect(result).toEqual(eventWithoutCoordinates);
    });
  });

  describe('updateTicketCount', () => {
    it('should update ticket count successfully', async () => {
      repository.updateTicketCount.mockResolvedValue(true);

      await service.updateTicketCount('507f1f77bcf86cd799439011', 'general', 5);

      expect(repository.updateTicketCount).toHaveBeenCalledWith('507f1f77bcf86cd799439011', 'general', 5);
    });

    it('should throw BadRequestException when update fails', async () => {
      repository.updateTicketCount.mockResolvedValue(false);

      await expect(service.updateTicketCount('507f1f77bcf86cd799439011', 'general', 5))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('detectCriticalChange', () => {
    it('should detect location change', () => {
      const originalEvent = { culturalPlaceId: 'old-place-id' };
      const updateData = { culturalPlaceId: 'new-place-id' };

      const result = (service as any).detectCriticalChange(originalEvent, updateData);

      expect(result).toBe('location_change');
    });

    it('should detect date change', () => {
      const originalEvent = { date: '2024-12-25' };
      const updateData = { date: '2024-12-26' };

      const result = (service as any).detectCriticalChange(originalEvent, updateData);

      expect(result).toBe('date_change');
    });

    it('should detect time change', () => {
      const originalEvent = { time: '20:00' };
      const updateData = { time: '21:00' };

      const result = (service as any).detectCriticalChange(originalEvent, updateData);

      expect(result).toBe('time_change');
    });

    it('should detect date_time_change when both date and time change', () => {
      const originalEvent = { date: '2024-12-25', time: '20:00' };
      const updateData = { date: '2024-12-26', time: '21:00' };

      const result = (service as any).detectCriticalChange(originalEvent, updateData);

      expect(result).toBe('date_time_change');
    });

    it('should return null when no critical change detected', () => {
      const originalEvent = { name: 'Event', description: 'Description' };
      const updateData = { name: 'Updated Event' };

      const result = (service as any).detectCriticalChange(originalEvent, updateData);

      expect(result).toBe(null);
    });
  });

  describe('getChangeValues', () => {
    it('should return location change values', async () => {
      const originalEvent = { culturalPlaceId: { name: 'Old Place' } };
      const updatedEvent = { culturalPlaceId: { name: 'New Place' } };

      const result = await (service as any).getChangeValues(originalEvent, updatedEvent, 'location_change');

      expect(result).toEqual({
        oldValue: 'Old Place',
        newValue: 'New Place',
      });
    });

    it('should return N/A for location change when names are not available', async () => {
      const originalEvent = { culturalPlaceId: {} };
      const updatedEvent = { culturalPlaceId: {} };

      const result = await (service as any).getChangeValues(originalEvent, updatedEvent, 'location_change');

      expect(result).toEqual({
        oldValue: 'N/A',
        newValue: 'N/A',
      });
    });

    it('should return formatted date change values', async () => {
      const originalEvent = { date: new Date('2024-12-25T00:00:00.000Z') };
      const updatedEvent = { date: new Date('2024-12-26T00:00:00.000Z') };

      const result = await (service as any).getChangeValues(originalEvent, updatedEvent, 'date_change');

      expect(result.oldValue).toMatch(/\d{2}\/\d{2}\/\d{4}/);
      expect(result.newValue).toMatch(/\d{2}\/\d{2}\/\d{4}/);
      expect(result.oldValue).not.toBe(result.newValue);
    });

    it('should handle date change with string dates', async () => {
      const originalEvent = { date: '2024-12-25T00:00:00.000Z' };
      const updatedEvent = { date: '2024-12-26T00:00:00.000Z' };

      const result = await (service as any).getChangeValues(originalEvent, updatedEvent, 'date_change');

      expect(result.oldValue).toMatch(/\d{2}\/\d{2}\/\d{4}/);
      expect(result.newValue).toMatch(/\d{2}\/\d{2}\/\d{4}/);
      expect(result.oldValue).not.toBe(result.newValue);
    });

    it('should handle invalid dates in date change', async () => {
      const originalEvent = { date: 'invalid-date' };
      const updatedEvent = { date: '2024-12-26T00:00:00.000Z' };

      const result = await (service as any).getChangeValues(originalEvent, updatedEvent, 'date_change');

      expect(result.oldValue).toContain('Fecha inválida');
      expect(result.newValue).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it('should handle date parsing errors in date change', async () => {
      const originalEvent = { date: { toString: () => 'invalid' } };
      const updatedEvent = { date: '2024-12-26T00:00:00.000Z' };

      const result = await (service as any).getChangeValues(originalEvent, updatedEvent, 'date_change');

      expect(result.oldValue).toContain('Fecha inválida');
      expect(result.newValue).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it('should return formatted date_time_change values', async () => {
      const originalEvent = { date: new Date('2024-12-25T00:00:00.000Z'), time: '20:00' };
      const updatedEvent = { date: new Date('2024-12-26T00:00:00.000Z'), time: '21:00' };

      const result = await (service as any).getChangeValues(originalEvent, updatedEvent, 'date_time_change');

      expect(result.oldValue).toMatch(/\d{2}\/\d{2}\/\d{4} a las 20:00/);
      expect(result.newValue).toMatch(/\d{2}\/\d{2}\/\d{4} a las 21:00/);
      expect(result.oldValue).not.toBe(result.newValue);
    });

    it('should handle invalid dates in date_time_change', async () => {
      const originalEvent = { date: 'invalid-date', time: '20:00' };
      const updatedEvent = { date: '2024-12-26T00:00:00.000Z', time: '21:00' };

      const result = await (service as any).getChangeValues(originalEvent, updatedEvent, 'date_time_change');

      expect(result.oldValue).toContain('Fecha inválida');
      expect(result.newValue).toMatch(/\d{2}\/\d{2}\/\d{4} a las 21:00/);
    });

    it('should return time change values', async () => {
      const originalEvent = { time: '20:00' };
      const updatedEvent = { time: '21:00' };

      const result = await (service as any).getChangeValues(originalEvent, updatedEvent, 'time_change');

      expect(result).toEqual({
        oldValue: '20:00',
        newValue: '21:00',
      });
    });
  });
});
