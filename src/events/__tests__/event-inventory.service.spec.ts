import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { EventInventoryService } from '../event-inventory.service';
import { EVENT_REPOSITORY } from '../interfaces/event.repository.token';
import { EventNotFoundException } from '../../common/exceptions/event-not-found.exception';
import { EventInactiveException } from '../../common/exceptions/event-inactive.exception';
import { EventExpiredException } from '../../common/exceptions/event-expired.exception';

describe('EventInventoryService', () => {
  let service: EventInventoryService;
  let repository: any;

  const mockEvent = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Test Event',
    description: 'Test Description',
    date: '2025-12-31T20:00:00.000Z',
    time: '20:00',
    isActive: true,
    ticketTypes: [
      {
        type: 'general',
        price: 1000,
        initialQuantity: 50,
        soldQuantity: 10,
        isActive: true,
      },
      {
        type: 'vip',
        price: 2000,
        initialQuantity: 20,
        soldQuantity: 5,
        isActive: true,
      },
    ],
  };

  const mockInactiveEvent = {
    ...mockEvent,
    isActive: false,
  };

  const mockExpiredEvent = {
    ...mockEvent,
    date: '2020-01-01T20:00:00.000Z', // Fecha pasada
  };

  const mockRepository = {
    findById: jest.fn(),
    updateTicketCount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventInventoryService,
        {
          provide: EVENT_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<EventInventoryService>(EventInventoryService);
    repository = module.get(EVENT_REPOSITORY);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateEventForTicketPurchase', () => {
    it('should return event when validation passes', async () => {
      repository.findById.mockResolvedValue(mockEvent);

      const result = await service.validateEventForTicketPurchase('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockEvent);
      expect(repository.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should throw NotFoundException when event does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.validateEventForTicketPurchase('507f1f77bcf86cd799439011')
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw EventInactiveException when event is inactive', async () => {
      repository.findById.mockResolvedValue(mockInactiveEvent);

      await expect(
        service.validateEventForTicketPurchase('507f1f77bcf86cd799439011')
      ).rejects.toThrow(EventInactiveException);
    });

    it('should return event when event date has passed (no date validation)', async () => {
      repository.findById.mockResolvedValue(mockExpiredEvent);

      const result = await service.validateEventForTicketPurchase('507f1f77bcf86cd799439011');
      expect(result).toEqual(mockExpiredEvent);
    });
  });

  describe('checkTicketAvailability', () => {
    it('should return true when tickets are available', async () => {
      repository.findById.mockResolvedValue(mockEvent);

      const result = await service.checkTicketAvailability(
        '507f1f77bcf86cd799439011',
        'general',
        5
      );

      expect(result).toBe(true);
      expect(repository.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should return false when not enough tickets available', async () => {
      repository.findById.mockResolvedValue(mockEvent);

      const result = await service.checkTicketAvailability(
        '507f1f77bcf86cd799439011',
        'general',
        50 // Más de lo disponible (50 - 10 = 40)
      );

      expect(result).toBe(false);
    });

    it('should return false when ticket type is inactive', async () => {
      const eventWithInactiveTicketType = {
        ...mockEvent,
        ticketTypes: [
          {
            type: 'general',
            price: 1000,
            initialQuantity: 50,
            soldQuantity: 10,
            isActive: false, // Tipo inactivo
          },
        ],
      };
      repository.findById.mockResolvedValue(eventWithInactiveTicketType);

      const result = await service.checkTicketAvailability(
        '507f1f77bcf86cd799439011',
        'general',
        5
      );

      expect(result).toBe(false);
    });

    it('should return false when ticket type does not exist', async () => {
      repository.findById.mockResolvedValue(mockEvent);

      const result = await service.checkTicketAvailability(
        '507f1f77bcf86cd799439011',
        'nonexistent',
        5
      );

      expect(result).toBe(false);
    });

    it('should throw EventNotFoundException when event does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.checkTicketAvailability('507f1f77bcf86cd799439011', 'general', 5)
      ).rejects.toThrow(EventNotFoundException);
    });
  });

  describe('getTicketAvailability', () => {
    it('should return available quantity for active ticket type', async () => {
      repository.findById.mockResolvedValue(mockEvent);

      const result = await service.getTicketAvailability(
        '507f1f77bcf86cd799439011',
        'general'
      );

      expect(result).toBe(40); // 50 - 10 = 40
      expect(repository.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should return 0 for inactive ticket type', async () => {
      const eventWithInactiveTicketType = {
        ...mockEvent,
        ticketTypes: [
          {
            type: 'general',
            price: 1000,
            initialQuantity: 50,
            soldQuantity: 10,
            isActive: false,
          },
        ],
      };
      repository.findById.mockResolvedValue(eventWithInactiveTicketType);

      const result = await service.getTicketAvailability(
        '507f1f77bcf86cd799439011',
        'general'
      );

      expect(result).toBe(0);
    });

    it('should return 0 for nonexistent ticket type', async () => {
      repository.findById.mockResolvedValue(mockEvent);

      const result = await service.getTicketAvailability(
        '507f1f77bcf86cd799439011',
        'nonexistent'
      );

      expect(result).toBe(0);
    });

    it('should throw EventNotFoundException when event does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.getTicketAvailability('507f1f77bcf86cd799439011', 'general')
      ).rejects.toThrow(EventNotFoundException);
    });
  });

  describe('updateTicketCount', () => {
    it('should update ticket count successfully', async () => {
      repository.updateTicketCount.mockResolvedValue(true);

      await service.updateTicketCount('507f1f77bcf86cd799439011', 'general', 5);

      expect(repository.updateTicketCount).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        'general',
        5
      );
    });

    it('should throw BadRequestException when update fails', async () => {
      repository.updateTicketCount.mockResolvedValue(false);

      await expect(
        service.updateTicketCount('507f1f77bcf86cd799439011', 'general', 5)
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when update returns null', async () => {
      repository.updateTicketCount.mockResolvedValue(null);

      await expect(
        service.updateTicketCount('507f1f77bcf86cd799439011', 'general', 5)
      ).rejects.toThrow(BadRequestException);
    });
  });
});
