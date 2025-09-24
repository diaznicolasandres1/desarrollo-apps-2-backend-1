import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { EventsService } from '../events.service';
import { EVENT_REPOSITORY } from '../interfaces/event.repository.token';
import { EventNotFoundException } from '../../common/exceptions/event-not-found.exception';
import { EventInactiveException } from '../../common/exceptions/event-inactive.exception';
import { EventExpiredException } from '../../common/exceptions/event-expired.exception';
import { EventNotificationService } from '../../notifications/event-notification.service';

describe('EventsService Validation Tests', () => {
  let service: EventsService;
  let mockEventRepository: any;

  const mockEvent = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Test Event',
    description: 'Test Description',
    date: new Date('2025-12-25'),
    time: '18:00',
    isActive: true,
    ticketTypes: [
      {
        type: 'general',
        price: 1000,
        initialQuantity: 10,
        soldQuantity: 5,
        isActive: true
      },
      {
        type: 'vip',
        price: 2000,
        initialQuantity: 5,
        soldQuantity: 2,
        isActive: true
      }
    ]
  };

  const mockEventWithoutImage = {
    ...mockEvent,
    // Sin campo image - debe ser válido
  };

  const mockExpiredEvent = {
    ...mockEvent,
    date: new Date('2020-01-01')
  };

  const mockInactiveEvent = {
    ...mockEvent,
    isActive: false
  };

  beforeEach(async () => {
    mockEventRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      toggleActive: jest.fn(),
      findByCulturalPlace: jest.fn(),
      findByDateRange: jest.fn(),
      findActiveEvents: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: EVENT_REPOSITORY,
          useValue: mockEventRepository,
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
  });

  describe('validateEventForTicketPurchase', () => {
    it('should throw EventNotFoundException when event does not exist', async () => {
      mockEventRepository.findById.mockResolvedValue(null);

      await expect(service.validateEventForTicketPurchase('507f1f77bcf86cd799439011')).rejects.toThrow(
        EventNotFoundException
      );
    });

    it('should throw EventInactiveException when event is not active', async () => {
      mockEventRepository.findById.mockResolvedValue(mockInactiveEvent);

      await expect(service.validateEventForTicketPurchase('507f1f77bcf86cd799439011')).rejects.toThrow(
        EventInactiveException
      );
    });

    it('should throw EventExpiredException when event date has passed', async () => {
      mockEventRepository.findById.mockResolvedValue(mockExpiredEvent);

      await expect(service.validateEventForTicketPurchase('507f1f77bcf86cd799439011')).rejects.toThrow(
        EventExpiredException
      );
    });

    it('should return event when all validations pass', async () => {
      mockEventRepository.findById.mockResolvedValue(mockEvent);

      const result = await service.validateEventForTicketPurchase('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockEvent);
    });
  });

  describe('checkTicketAvailability', () => {
    beforeEach(() => {
      mockEventRepository.findById.mockResolvedValue(mockEvent);
    });

    it('should return true when enough tickets are available', async () => {
      const result = await service.checkTicketAvailability('507f1f77bcf86cd799439011', 'general', 3);

      expect(result).toBe(true);
    });

    it('should return false when not enough tickets are available', async () => {
      const result = await service.checkTicketAvailability('507f1f77bcf86cd799439011', 'general', 10);

      expect(result).toBe(false);
    });

    it('should throw BadRequestException when ticket type does not exist', async () => {
      await expect(service.checkTicketAvailability('507f1f77bcf86cd799439011', 'invalid', 1)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should throw BadRequestException when ticket type is not active', async () => {
      const eventWithInactiveTicket = {
        ...mockEvent,
        ticketTypes: [
          {
            type: 'general',
            price: 1000,
            initialQuantity: 10,
            soldQuantity: 5,
            isActive: false
          }
        ]
      };
      mockEventRepository.findById.mockResolvedValue(eventWithInactiveTicket);

      await expect(service.checkTicketAvailability('507f1f77bcf86cd799439011', 'general', 1)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('getTicketAvailability', () => {
    beforeEach(() => {
      mockEventRepository.findById.mockResolvedValue(mockEvent);
    });

    it('should return correct available quantity', async () => {
      const result = await service.getTicketAvailability('507f1f77bcf86cd799439011', 'general');

      expect(result).toBe(5); // 10 - 5
    });

    it('should return correct available quantity for vip tickets', async () => {
      const result = await service.getTicketAvailability('507f1f77bcf86cd799439011', 'vip');

      expect(result).toBe(3); // 5 - 2
    });

    it('should throw BadRequestException when ticket type does not exist', async () => {
      await expect(service.getTicketAvailability('507f1f77bcf86cd799439011', 'invalid')).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('Event Creation with Optional Image', () => {
    it('should create event without image field', async () => {
      mockEventRepository.create.mockResolvedValue(mockEventWithoutImage);

      const result = await service.create({
        culturalPlaceId: '507f1f77bcf86cd799439011',
        name: 'Test Event',
        description: 'Test Description',
        date: '2025-12-25',
        time: '18:00',
        ticketTypes: [
          {
            type: 'general',
            price: 1000,
            initialQuantity: 10
          }
        ]
        // Sin campo image - debe ser válido
      });

      expect(result).toEqual(mockEventWithoutImage);
      expect(mockEventRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Event',
          description: 'Test Description',
          // image no debe estar presente o debe ser undefined
        })
      );
    });

    it('should create event with image field when provided', async () => {
      const eventWithImage = { ...mockEventWithoutImage, image: 'https://example.com/image.jpg' };
      mockEventRepository.create.mockResolvedValue(eventWithImage);

      const result = await service.create({
        culturalPlaceId: '507f1f77bcf86cd799439011',
        name: 'Test Event',
        description: 'Test Description',
        date: '2025-12-25',
        time: '18:00',
        image: 'https://example.com/image.jpg',
        ticketTypes: [
          {
            type: 'general',
            price: 1000,
            initialQuantity: 10
          }
        ]
      });

      expect(result).toEqual(eventWithImage);
      expect(mockEventRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Event',
          description: 'Test Description',
          image: 'https://example.com/image.jpg'
        })
      );
    });
  });
});
