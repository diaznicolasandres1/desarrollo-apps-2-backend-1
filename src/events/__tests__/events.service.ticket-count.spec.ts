import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { EventsService } from '../events.service';
import { EVENT_REPOSITORY } from '../interfaces/event.repository.token';
import { EventNotificationService } from '../../notifications/event-notification.service';
import { EventValidator } from '../validators/event.validator';
import { TicketValidator } from '../validators/ticket.validator';
import { EventBusinessValidator } from '../validators/event-business.validator';
import { EventDataTransformer } from '../transformers/event-data.transformer';
import { EventChangeNotifier } from '../change-detection/event-change-notifier.service';
import { TicketAvailabilityService } from '../ticket-management/ticket-availability.service';
import { TicketQuantityService } from '../ticket-management/ticket-quantity.service';

describe('EventsService Ticket Count Tests', () => {
  let service: EventsService;
  let mockEventRepository: any;
  let mockTicketQuantityService: any;

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
        {
          provide: EventValidator,
          useValue: {
            validateEventData: jest.fn(),
            validateEventDate: jest.fn(),
            validateEventTime: jest.fn(),
          },
        },
        {
          provide: TicketValidator,
          useValue: {
            validateTicketTypes: jest.fn(),
          },
        },
        {
          provide: EventBusinessValidator,
          useValue: {
            validateEventForTicketPurchase: jest.fn(),
          },
        },
        {
          provide: EventDataTransformer,
          useValue: {
            transformCreateEventData: jest.fn(),
            transformEventsCoordinates: jest.fn(),
            transformEventCoordinates: jest.fn(),
          },
        },
        {
          provide: EventChangeNotifier,
          useValue: {
            notifyEventChange: jest.fn(),
            notifyStatusChange: jest.fn(),
          },
        },
        {
          provide: TicketAvailabilityService,
          useValue: {
            checkTicketAvailability: jest.fn(),
            getTicketAvailability: jest.fn(),
          },
        },
        {
          provide: TicketQuantityService,
          useValue: {
            updateTicketCount: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    mockTicketQuantityService = module.get<TicketQuantityService>(TicketQuantityService);
  });

  describe('updateTicketCount', () => {
    it('should successfully update ticket count', async () => {
      mockTicketQuantityService.updateTicketCount.mockResolvedValue(true);

      await service.updateTicketCount('507f1f77bcf86cd799439011', 'general', 2);

      expect(mockTicketQuantityService.updateTicketCount).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        'general',
        2
      );
    });

    it('should throw BadRequestException when update fails', async () => {
      mockTicketQuantityService.updateTicketCount.mockRejectedValue(
        new BadRequestException('Failed to update ticket count')
      );

      await expect(
        service.updateTicketCount('507f1f77bcf86cd799439011', 'general', 2)
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when update throws error', async () => {
      mockTicketQuantityService.updateTicketCount.mockRejectedValue(
        new BadRequestException('Update error')
      );

      await expect(
        service.updateTicketCount('507f1f77bcf86cd799439011', 'general', 2)
      ).rejects.toThrow(BadRequestException);
    });
  });
});
