import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { EventsService } from '../events.service';
import { EVENT_REPOSITORY } from '../interfaces/event.repository.token';
import { EventNotificationService } from '../../notifications/event-notification.service';

describe('EventsService Ticket Count Tests', () => {
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
      updateTicketCount: jest.fn(),
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

  describe('updateTicketCount', () => {
    it('should successfully update ticket count', async () => {
      mockEventRepository.updateTicketCount.mockResolvedValue(true);

      await service.updateTicketCount('507f1f77bcf86cd799439011', 'general', 2);

      expect(mockEventRepository.updateTicketCount).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        'general',
        2
      );
    });

    it('should throw BadRequestException when update fails', async () => {
      mockEventRepository.updateTicketCount.mockResolvedValue(false);

      await expect(
        service.updateTicketCount('507f1f77bcf86cd799439011', 'general', 2)
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when update throws error', async () => {
      mockEventRepository.updateTicketCount.mockResolvedValue(false);

      await expect(
        service.updateTicketCount('507f1f77bcf86cd799439011', 'general', 2)
      ).rejects.toThrow(BadRequestException);
    });
  });
});
