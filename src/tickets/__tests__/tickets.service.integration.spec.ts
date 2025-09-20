import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { TicketsService } from '../tickets.service';
import { EventValidationService } from '../../events/event-validation.service';
import { TICKET_REPOSITORY } from '../interfaces/ticket.repository.token';
import { EventNotFoundException } from '../../common/exceptions/event-not-found.exception';
import { EventInactiveException } from '../../common/exceptions/event-inactive.exception';
import { EventExpiredException } from '../../common/exceptions/event-expired.exception';
import { InsufficientTicketsException } from '../../common/exceptions/insufficient-tickets.exception';
import { UserService } from '../../users/user/user.service';
import { EmailService } from '../../email/email.service';

describe('TicketsService Integration Tests', () => {
  let service: TicketsService;
  let eventValidationService: EventValidationService;
  let mockTicketRepository: any;

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

  const mockExpiredEvent = {
    ...mockEvent,
    date: new Date('2020-01-01')
  };

  const mockInactiveEvent = {
    ...mockEvent,
    isActive: false
  };

  const mockEventWithNoAvailability = {
    ...mockEvent,
    ticketTypes: [
      {
        type: 'general',
        price: 1000,
        initialQuantity: 5,
        soldQuantity: 5,
        isActive: true
      }
    ]
  };

  beforeEach(async () => {
    mockTicketRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      markAsUsed: jest.fn(),
      cancelTicket: jest.fn(),
      findByEvent: jest.fn(),
      findByUser: jest.fn(),
      findByEventAndUser: jest.fn(),
      findByStatus: jest.fn(),
      findActiveTickets: jest.fn(),
      countByEventAndType: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketsService,
        {
          provide: TICKET_REPOSITORY,
          useValue: mockTicketRepository,
        },
        {
          provide: EventValidationService,
          useValue: {
            validateEventForTicketPurchase: jest.fn(),
            checkTicketAvailability: jest.fn(),
            getTicketAvailability: jest.fn(),
            updateTicketCount: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendTicketConfirmationEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TicketsService>(TicketsService);
    eventValidationService = module.get<EventValidationService>(EventValidationService);
  });

  describe('purchaseTicket', () => {
    const purchaseTicketDto = {
      eventId: '507f1f77bcf86cd799439011',
      userId: '507f1f77bcf86cd799439012',
      ticketType: 'general',
      quantity: 2
    };

    it('should throw EventNotFoundException when event does not exist', async () => {
      jest.spyOn(eventValidationService, 'validateEventForTicketPurchase').mockRejectedValue(
        new EventNotFoundException('507f1f77bcf86cd799439011')
      );

      await expect(service.purchaseTicket(purchaseTicketDto)).rejects.toThrow(
        EventNotFoundException
      );
    });

    it('should throw EventInactiveException when event is not active', async () => {
      jest.spyOn(eventValidationService, 'validateEventForTicketPurchase').mockRejectedValue(
        new EventInactiveException('507f1f77bcf86cd799439011')
      );

      await expect(service.purchaseTicket(purchaseTicketDto)).rejects.toThrow(
        EventInactiveException
      );
    });

    it('should throw EventExpiredException when event date has passed', async () => {
      jest.spyOn(eventValidationService, 'validateEventForTicketPurchase').mockRejectedValue(
        new EventExpiredException('507f1f77bcf86cd799439011', new Date('2020-01-01'))
      );

      await expect(service.purchaseTicket(purchaseTicketDto)).rejects.toThrow(
        EventExpiredException
      );
    });

    it('should throw InsufficientTicketsException when not enough tickets available', async () => {
      jest.spyOn(eventValidationService, 'validateEventForTicketPurchase').mockResolvedValue(mockEvent);
      jest.spyOn(eventValidationService, 'checkTicketAvailability').mockResolvedValue(false);
      jest.spyOn(eventValidationService, 'getTicketAvailability').mockResolvedValue(1);

      await expect(service.purchaseTicket(purchaseTicketDto)).rejects.toThrow(
        InsufficientTicketsException
      );
    });

    it('should throw BadRequestException when quantity is invalid', async () => {
      const invalidDto = { ...purchaseTicketDto, quantity: 0 };

      await expect(service.purchaseTicket(invalidDto)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should throw BadRequestException when quantity exceeds limit', async () => {
      const invalidDto = { ...purchaseTicketDto, quantity: 15 };

      await expect(service.purchaseTicket(invalidDto)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should successfully purchase tickets when all validations pass', async () => {
      const mockTickets = [
        {
          _id: '507f1f77bcf86cd799439013',
          eventId: '507f1f77bcf86cd799439011',
          userId: '507f1f77bcf86cd799439012',
          ticketType: 'general',
          price: 1000,
          status: 'active'
        },
        {
          _id: '507f1f77bcf86cd799439014',
          eventId: '507f1f77bcf86cd799439011',
          userId: '507f1f77bcf86cd799439012',
          ticketType: 'general',
          price: 1000,
          status: 'active'
        }
      ];

      jest.spyOn(eventValidationService, 'validateEventForTicketPurchase').mockResolvedValue(mockEvent);
      jest.spyOn(eventValidationService, 'checkTicketAvailability').mockResolvedValue(true);
      jest.spyOn(eventValidationService, 'updateTicketCount').mockResolvedValue(undefined);
      mockTicketRepository.create
        .mockResolvedValueOnce(mockTickets[0])
        .mockResolvedValueOnce(mockTickets[1]);

      const result = await service.purchaseTicket(purchaseTicketDto);

      expect(result).toHaveLength(2);
      expect(result[0].ticketType).toBe('general');
      expect(result[0].price).toBe(1000);
      expect(mockTicketRepository.create).toHaveBeenCalledTimes(2);
      expect(eventValidationService.updateTicketCount).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        'general',
        2
      );
    });

    it('should update ticket count when purchasing tickets', async () => {
      const mockTickets = [
        {
          _id: '507f1f77bcf86cd799439013',
          eventId: '507f1f77bcf86cd799439011',
          userId: '507f1f77bcf86cd799439012',
          ticketType: 'vip',
          price: 2000,
          status: 'active'
        }
      ];

      jest.spyOn(eventValidationService, 'validateEventForTicketPurchase').mockResolvedValue(mockEvent);
      jest.spyOn(eventValidationService, 'checkTicketAvailability').mockResolvedValue(true);
      jest.spyOn(eventValidationService, 'updateTicketCount').mockResolvedValue(undefined);
      mockTicketRepository.create.mockResolvedValue(mockTickets[0]);

      const purchaseDto = { ...purchaseTicketDto, ticketType: 'vip', quantity: 1 };
      await service.purchaseTicket(purchaseDto);

      expect(eventValidationService.updateTicketCount).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        'vip',
        1
      );
    });
  });
});
