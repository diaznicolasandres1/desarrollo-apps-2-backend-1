import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EventsService } from '../events.service';
import type { EventRepository } from '../interfaces/event.repository.interface';
import { EVENT_REPOSITORY } from '../interfaces/event.repository.token';
import { CreateEventDto } from '../dto/create-event.dto';
import { UpdateEventDto } from '../dto/update-event.dto';

describe('EventsService', () => {
  let service: EventsService;
  let repository: jest.Mocked<EventRepository>;

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
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: EVENT_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    repository = module.get(EVENT_REPOSITORY);
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
  });

  describe('toggleActive', () => {
    it('should toggle event active status', async () => {
      const toggledEvent = { ...mockEvent, isActive: false };
      repository.toggleActive.mockResolvedValue(toggledEvent);

      const result = await service.toggleActive('507f1f77bcf86cd799439011');

      expect(result).toEqual(toggledEvent);
      expect(repository.toggleActive).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should throw NotFoundException if event not found', async () => {
      repository.toggleActive.mockResolvedValue(null);

      await expect(service.toggleActive('invalid-id')).rejects.toThrow(NotFoundException);
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
});
