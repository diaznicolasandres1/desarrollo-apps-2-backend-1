import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TicketsService } from '../tickets.service';
import type { TicketRepository } from '../interfaces/ticket.repository.interface';
import { TICKET_REPOSITORY } from '../interfaces/ticket.repository.token';
import { PurchaseTicketDto } from '../dto/purchase-ticket.dto';
import { UpdateTicketDto } from '../dto/update-ticket.dto';
import { PurchaseMultipleTicketsDto } from '../dto/purchase-multiple-tickets.dto';
import { InsufficientTicketsException } from '../../common/exceptions/insufficient-tickets.exception';
import { EventInventoryService } from '../../events/event-inventory.service';
import { UserService } from '../../users/user/user.service';
import { EmailService } from '../../email/email.service';

describe('TicketsService', () => {
  let service: TicketsService;
  let repository: jest.Mocked<TicketRepository>;
  let eventInventoryService: jest.Mocked<EventInventoryService>;
  let userService: jest.Mocked<UserService>;
  let emailService: jest.Mocked<EmailService>;
  let module: TestingModule;

  const mockTicket: any = {
    _id: '507f1f77bcf86cd799439011',
    eventId: '507f1f77bcf86cd799439012',
    userId: '507f1f77bcf86cd799439013',
    ticketType: 'general',
    price: 1000,
    status: 'active',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByEvent: jest.fn(),
    findByUser: jest.fn(),
    findByEventAndUser: jest.fn(),
    findByStatus: jest.fn(),
    findActiveTickets: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    markAsUsed: jest.fn(),
    cancelTicket: jest.fn(),
    countByEventAndType: jest.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        TicketsService,
        {
          provide: TICKET_REPOSITORY,
          useValue: mockRepository,
        },
        {
          provide: EventInventoryService,
          useValue: {
            validateEventForTicketPurchase: jest.fn(),
            checkTicketAvailability: jest.fn(),
            getTicketAvailability: jest.fn(),
            updateTicketCount: jest.fn(),
            findOne: jest.fn(),
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
    repository = module.get(TICKET_REPOSITORY);
    eventInventoryService = module.get(EventInventoryService) as jest.Mocked<EventInventoryService>;
    userService = module.get(UserService) as jest.Mocked<UserService>;
    emailService = module.get(EmailService) as jest.Mocked<EmailService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('purchaseTicket', () => {
    const purchaseTicketDto: PurchaseTicketDto = {
      eventId: '507f1f77bcf86cd799439012',
      userId: '507f1f77bcf86cd799439013',
      ticketType: 'general',
      quantity: 2,
    };

    it('should purchase tickets successfully', async () => {
      const mockEvent: any = {
        _id: '507f1f77bcf86cd799439012',
        culturalPlaceId: '507f1f77bcf86cd799439015',
        name: 'Test Event',
        description: 'Test Description',
        date: new Date('2025-12-25'),
        time: '18:00',
        isActive: true,
        ticketTypes: [
          { type: 'general', price: 1000, initialQuantity: 10, soldQuantity: 5 }
        ]
      };
      
      const createdTickets = [mockTicket, { ...mockTicket, _id: '507f1f77bcf86cd799439014' }];
      
      // Mock EventValidationService methods
      const eventInventoryService = module.get(EventInventoryService) as jest.Mocked<EventInventoryService>;
      eventInventoryService.validateEventForTicketPurchase.mockResolvedValue(mockEvent);
      eventInventoryService.checkTicketAvailability.mockResolvedValue(true);
      eventInventoryService.getTicketAvailability.mockResolvedValue(5);
      eventInventoryService.updateTicketCount.mockResolvedValue(undefined);
      
      repository.create.mockResolvedValueOnce(createdTickets[0]);
      repository.create.mockResolvedValueOnce(createdTickets[1]);

      const result = await service.purchaseTicket(purchaseTicketDto);

      expect(result).toEqual(createdTickets);
      expect(repository.create).toHaveBeenCalledTimes(2);
      expect(repository.create).toHaveBeenCalledWith({
        eventId: expect.any(Object),
        userId: expect.any(Object),
        ticketType: 'general',
        price: 1000,
        status: 'active',
      });
    });

    it('should throw BadRequestException for invalid quantity (less than 1)', async () => {
      const invalidDto = { ...purchaseTicketDto, quantity: 0 };

      await expect(service.purchaseTicket(invalidDto)).rejects.toThrow(BadRequestException);
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid quantity (more than 10)', async () => {
      const invalidDto = { ...purchaseTicketDto, quantity: 11 };

      await expect(service.purchaseTicket(invalidDto)).rejects.toThrow(BadRequestException);
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('should use default quantity of 1 when not specified', async () => {
      const dtoWithoutQuantity = { ...purchaseTicketDto };
      delete dtoWithoutQuantity.quantity;
      
      const mockEvent: any = {
        _id: '507f1f77bcf86cd799439012',
        culturalPlaceId: '507f1f77bcf86cd799439015',
        name: 'Test Event',
        description: 'Test Description',
        date: new Date('2025-12-25'),
        time: '18:00',
        isActive: true,
        ticketTypes: [
          { type: 'general', price: 1000, initialQuantity: 10, soldQuantity: 5 }
        ]
      };
      
      // Mock EventValidationService methods
      const eventInventoryService = module.get(EventInventoryService) as jest.Mocked<EventInventoryService>;
      eventInventoryService.validateEventForTicketPurchase.mockResolvedValue(mockEvent);
      eventInventoryService.checkTicketAvailability.mockResolvedValue(true);
      eventInventoryService.getTicketAvailability.mockResolvedValue(5);
      eventInventoryService.updateTicketCount.mockResolvedValue(undefined);
      
      repository.create.mockResolvedValue(mockTicket);

      const result = await service.purchaseTicket(dtoWithoutQuantity);

      expect(result).toEqual([mockTicket]);
      expect(repository.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAll', () => {
    it('should return all tickets', async () => {
      const tickets = [mockTicket];
      repository.findAll.mockResolvedValue(tickets);

      const result = await service.findAll();

      expect(result).toEqual(tickets);
      expect(repository.findAll).toHaveBeenCalledWith(undefined);
    });

    it('should return filtered tickets', async () => {
      const tickets = [mockTicket];
      const query = { eventId: '507f1f77bcf86cd799439012' };
      repository.findAll.mockResolvedValue(tickets);

      const result = await service.findAll(query);

      expect(result).toEqual(tickets);
      expect(repository.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('should return a ticket by id', async () => {
      repository.findById.mockResolvedValue(mockTicket);

      const result = await service.findOne('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockTicket);
      expect(repository.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should throw NotFoundException if ticket not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
      expect(repository.findById).toHaveBeenCalledWith('invalid-id');
    });
  });

  describe('findByEvent', () => {
    it('should return tickets for an event', async () => {
      const tickets = [mockTicket];
      repository.findByEvent.mockResolvedValue(tickets);

      const result = await service.findByEvent('507f1f77bcf86cd799439012');

      expect(result).toEqual(tickets);
      expect(repository.findByEvent).toHaveBeenCalledWith('507f1f77bcf86cd799439012');
    });
  });

  describe('findByUser', () => {
    it('should return tickets for a user', async () => {
      const tickets = [mockTicket];
      repository.findByUser.mockResolvedValue(tickets);

      const result = await service.findByUser('507f1f77bcf86cd799439013');

      expect(result).toEqual(tickets);
      expect(repository.findByUser).toHaveBeenCalledWith('507f1f77bcf86cd799439013', undefined);
    });
  });

  describe('findByUserWithEventDetails', () => {
    it('should return tickets for a user with populated event details', async () => {
      const fixedDate = new Date('2025-12-25T19:00:00.000Z');
      const mockTicketWithEventDetails = {
        ...mockTicket,
        toObject: jest.fn().mockReturnValue({
          ...mockTicket,
          eventId: {
            _id: '507f1f77bcf86cd799439012',
            name: 'Test Event',
            description: 'Test Description',
            date: fixedDate,
            time: '19:00',
            image: 'https://example.com/event-image.jpg',
            culturalPlaceId: {
              _id: '507f1f77bcf86cd799439014',
              name: 'Test Cultural Place',
              contact: {
                address: 'Test Address'
              },
              image: 'https://example.com/place-image.jpg'
            }
          }
        })
      };

      repository.findByUser.mockResolvedValue([mockTicketWithEventDetails]);

      const result = await service.findByUserWithEventDetails('507f1f77bcf86cd799439013');

      expect(result).toEqual([{
        _id: mockTicket._id,
        eventId: {
          _id: '507f1f77bcf86cd799439012',
          name: 'Test Event',
          description: 'Test Description',
          date: fixedDate, // Objeto Date completo
          time: '19:00',
          image: 'https://example.com/event-image.jpg',
          culturalPlaceId: {
            _id: '507f1f77bcf86cd799439014',
            name: 'Test Cultural Place',
            address: 'Test Address', // Directamente address, no contact.address
            image: 'https://example.com/place-image.jpg'
          }
        },
        userId: mockTicket.userId,
        ticketType: mockTicket.ticketType,
        price: mockTicket.price,
        status: mockTicket.status,
        purchaseDate: mockTicket.createdAt, // Usar createdAt como purchaseDate
        qrCode: mockTicket.qrCode,
        isActive: mockTicket.isActive
      }]);
      expect(repository.findByUser).toHaveBeenCalledWith('507f1f77bcf86cd799439013', {
        populate: [
          {
            path: 'eventId',
            select: '_id name description date time image',
            populate: {
              path: 'culturalPlaceId',
              select: '_id name contact.address image'
            }
          }
        ]
      });
    });

    it('should handle tickets without toObject method', async () => {
      const fixedDate = new Date('2025-12-25T19:00:00.000Z');
      const mockTicketWithoutToObject = {
        ...mockTicket,
        eventId: {
          _id: '507f1f77bcf86cd799439012',
          name: 'Test Event',
          description: 'Test Description',
          date: fixedDate,
          time: '19:00',
          image: 'https://example.com/event-image.jpg',
          culturalPlaceId: {
            _id: '507f1f77bcf86cd799439014',
            name: 'Test Cultural Place',
            contact: {
              address: 'Test Address'
            },
            image: 'https://example.com/place-image.jpg'
          }
        }
      };

      repository.findByUser.mockResolvedValue([mockTicketWithoutToObject]);

      const result = await service.findByUserWithEventDetails('507f1f77bcf86cd799439013');

      expect(result).toEqual([{
        _id: mockTicket._id,
        eventId: {
          _id: '507f1f77bcf86cd799439012',
          name: 'Test Event',
          description: 'Test Description',
          date: fixedDate, // Objeto Date completo
          time: '19:00',
          image: 'https://example.com/event-image.jpg',
          culturalPlaceId: {
            _id: '507f1f77bcf86cd799439014',
            name: 'Test Cultural Place',
            address: 'Test Address', // Directamente address, no contact.address
            image: 'https://example.com/place-image.jpg'
          }
        },
        userId: mockTicket.userId,
        ticketType: mockTicket.ticketType,
        price: mockTicket.price,
        status: mockTicket.status,
        purchaseDate: mockTicket.createdAt, // Usar createdAt como purchaseDate
        qrCode: mockTicket.qrCode,
        isActive: mockTicket.isActive
      }]);
      expect(repository.findByUser).toHaveBeenCalledWith('507f1f77bcf86cd799439013', {
        populate: [
          {
            path: 'eventId',
            select: '_id name description date time image',
            populate: {
              path: 'culturalPlaceId',
              select: '_id name contact.address image'
            }
          }
        ]
      });
    });
  });

  describe('findByEventAndUser', () => {
    it('should return tickets for event and user', async () => {
      const tickets = [mockTicket];
      repository.findByEventAndUser.mockResolvedValue(tickets);

      const result = await service.findByEventAndUser('507f1f77bcf86cd799439012', '507f1f77bcf86cd799439013');

      expect(result).toEqual(tickets);
      expect(repository.findByEventAndUser).toHaveBeenCalledWith('507f1f77bcf86cd799439012', '507f1f77bcf86cd799439013');
    });
  });

  describe('findByStatus', () => {
    it('should return tickets by status', async () => {
      const tickets = [mockTicket];
      repository.findByStatus.mockResolvedValue(tickets);

      const result = await service.findByStatus('active');

      expect(result).toEqual(tickets);
      expect(repository.findByStatus).toHaveBeenCalledWith('active');
    });
  });

  describe('findActiveTickets', () => {
    it('should return active tickets', async () => {
      const tickets = [mockTicket];
      repository.findActiveTickets.mockResolvedValue(tickets);

      const result = await service.findActiveTickets();

      expect(result).toEqual(tickets);
      expect(repository.findActiveTickets).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const updateTicketDto: UpdateTicketDto = {
      ticketType: 'vip',
      price: 2000,
    };

    it('should update a ticket successfully', async () => {
      const updatedTicket = { ...mockTicket, ...updateTicketDto };
      repository.findById.mockResolvedValue(mockTicket);
      repository.update.mockResolvedValue(updatedTicket);

      const result = await service.update('507f1f77bcf86cd799439011', updateTicketDto);

      expect(result).toEqual(updatedTicket);
      expect(repository.update).toHaveBeenCalledWith('507f1f77bcf86cd799439011', updateTicketDto);
    });

    it('should throw NotFoundException if ticket not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.update('invalid-id', updateTicketDto)).rejects.toThrow(NotFoundException);
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should convert ObjectIds when provided', async () => {
      const dtoWithIds = {
        eventId: '507f1f77bcf86cd799439012',
        userId: '507f1f77bcf86cd799439013',
      };
      const updatedTicket = { ...mockTicket, ...dtoWithIds };
      repository.findById.mockResolvedValue(mockTicket);
      repository.update.mockResolvedValue(updatedTicket);

      const result = await service.update('507f1f77bcf86cd799439011', dtoWithIds);

      expect(result).toEqual(updatedTicket);
      expect(repository.update).toHaveBeenCalledWith('507f1f77bcf86cd799439011', {
        eventId: expect.any(Object),
        userId: expect.any(Object),
      });
    });
  });

  describe('markAsUsed', () => {
    it('should mark ticket as used successfully', async () => {
      const usedTicket = { ...mockTicket, status: 'used', usedAt: new Date() };
      repository.findById.mockResolvedValue(mockTicket);
      repository.markAsUsed.mockResolvedValue(usedTicket);

      const result = await service.markAsUsed('507f1f77bcf86cd799439011');

      expect(result).toEqual(usedTicket);
      expect(repository.markAsUsed).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should throw NotFoundException if ticket not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.markAsUsed('invalid-id')).rejects.toThrow(NotFoundException);
      expect(repository.markAsUsed).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if ticket is not active', async () => {
      const usedTicket = { ...mockTicket, status: 'used' };
      repository.findById.mockResolvedValue(usedTicket);

      await expect(service.markAsUsed('507f1f77bcf86cd799439011')).rejects.toThrow(BadRequestException);
      expect(repository.markAsUsed).not.toHaveBeenCalled();
    });
  });

  describe('cancelTicket', () => {
    it('should cancel ticket successfully', async () => {
      const cancelledTicket = { 
        ...mockTicket, 
        status: 'cancelled', 
        cancelledAt: new Date(),
        cancellationReason: 'Event cancelled'
      };
      repository.findById.mockResolvedValue(mockTicket);
      repository.cancelTicket.mockResolvedValue(cancelledTicket);

      const result = await service.cancelTicket('507f1f77bcf86cd799439011', 'Event cancelled');

      expect(result).toEqual(cancelledTicket);
      expect(repository.cancelTicket).toHaveBeenCalledWith('507f1f77bcf86cd799439011', 'Event cancelled');
    });

    it('should throw NotFoundException if ticket not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.cancelTicket('invalid-id')).rejects.toThrow(NotFoundException);
      expect(repository.cancelTicket).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if ticket is not active', async () => {
      const cancelledTicket = { ...mockTicket, status: 'cancelled' };
      repository.findById.mockResolvedValue(cancelledTicket);

      await expect(service.cancelTicket('507f1f77bcf86cd799439011')).rejects.toThrow(BadRequestException);
      expect(repository.cancelTicket).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a ticket successfully', async () => {
      repository.findById.mockResolvedValue(mockTicket);
      repository.delete.mockResolvedValue(true);

      await service.remove('507f1f77bcf86cd799439011');

      expect(repository.delete).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should throw NotFoundException if ticket not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.remove('invalid-id')).rejects.toThrow(NotFoundException);
      expect(repository.delete).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if delete fails', async () => {
      repository.findById.mockResolvedValue(mockTicket);
      repository.delete.mockResolvedValue(false);

      await expect(service.remove('507f1f77bcf86cd799439011')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getTicketStats', () => {
    it('should return ticket statistics for an event', async () => {
      const tickets = [
        { ...mockTicket, status: 'active', ticketType: 'general' },
        { ...mockTicket, _id: '2', status: 'used', ticketType: 'vip' },
        { ...mockTicket, _id: '3', status: 'cancelled', ticketType: 'general' },
      ];
      repository.findByEvent.mockResolvedValue(tickets);

      const result = await service.getTicketStats('507f1f77bcf86cd799439012');

      expect(result).toEqual({
        eventId: '507f1f77bcf86cd799439012',
        totalTicketsSold: 3,
        totalRevenue: 3000,
        activeRevenue: 1000,
        ticketTypeStats: {
          general: {
            sold: 2,
            revenue: 2000,
            active: 1,
            used: 0,
            cancelled: 1,
          },
          vip: {
            sold: 1,
            revenue: 1000,
            active: 0,
            used: 1,
            cancelled: 0,
          },
          jubilados: {
            sold: 0,
            revenue: 0,
            active: 0,
            used: 0,
            cancelled: 0,
          },
          niños: {
            sold: 0,
            revenue: 0,
            active: 0,
            used: 0,
            cancelled: 0,
          },
        },
        statusBreakdown: {
          active: 1,
          used: 1,
          cancelled: 1,
        },
        averageTicketPrice: 1000,
      });
      expect(repository.findByEvent).toHaveBeenCalledWith('507f1f77bcf86cd799439012');
    });
  });

  describe('getTicketPrice', () => {
    it('should return correct prices for different ticket types', async () => {
      // This is a private method, but we can test it indirectly through purchaseTicket
      const purchaseDto = {
        eventId: '507f1f77bcf86cd799439012',
        userId: '507f1f77bcf86cd799439013',
        ticketType: 'vip',
        quantity: 1,
      };

      const mockEvent: any = {
        _id: '507f1f77bcf86cd799439012',
        culturalPlaceId: '507f1f77bcf86cd799439015',
        name: 'Test Event',
        description: 'Test Description',
        date: new Date('2025-12-25'),
        time: '18:00',
        isActive: true,
        ticketTypes: [
          { type: 'general', price: 1000, initialQuantity: 10, soldQuantity: 5 },
          { type: 'vip', price: 2000, initialQuantity: 5, soldQuantity: 2 }
        ]
      };

      // Mock EventValidationService methods
      const eventInventoryService = module.get(EventInventoryService) as jest.Mocked<EventInventoryService>;
      eventInventoryService.validateEventForTicketPurchase.mockResolvedValue(mockEvent);
      eventInventoryService.checkTicketAvailability.mockResolvedValue(true);
      eventInventoryService.getTicketAvailability.mockResolvedValue(3);
      eventInventoryService.updateTicketCount.mockResolvedValue(undefined);

      repository.create.mockResolvedValue(mockTicket);

      await service.purchaseTicket(purchaseDto);

      expect(repository.create).toHaveBeenCalledWith({
        eventId: expect.any(Object),
        userId: expect.any(Object),
        ticketType: 'vip',
        price: 2000, // VIP price
        status: 'active',
      });
    });
  });

  describe('sendTicketConfirmationEmail error handling', () => {
    it('should handle email sending error gracefully in purchaseTicket', async () => {
      const purchaseDto = {
        eventId: '507f1f77bcf86cd799439012',
        userId: '507f1f77bcf86cd799439013',
        ticketType: 'general',
        quantity: 1,
      };

      const mockEvent = {
        _id: '507f1f77bcf86cd799439012',
        name: 'Test Event',
        date: new Date('2025-12-31'),
        active: true,
        ticketTypes: [
          { type: 'general', price: 100, quantity: 100 },
        ],
      };

      const mockUser = {
        _id: '507f1f77bcf86cd799439013',
        name: 'Test User',
        email: 'test@example.com',
      };

      // Mock EventsService methods
      eventInventoryService.validateEventForTicketPurchase.mockResolvedValue(mockEvent);
      eventInventoryService.checkTicketAvailability.mockResolvedValue(true);
      eventInventoryService.getTicketAvailability.mockResolvedValue(5);
      eventInventoryService.updateTicketCount.mockResolvedValue(undefined);
      
      userService.findOne.mockResolvedValue(mockUser);
      repository.create.mockResolvedValue(mockTicket);
      
      // Mock email service to throw error
      emailService.sendTicketConfirmationEmail.mockRejectedValue(new Error('Email failed'));

      const result = await service.purchaseTicket(purchaseDto);

      expect(result).toEqual([mockTicket]);
      expect(emailService.sendTicketConfirmationEmail).toHaveBeenCalled();
    });

    it('should handle user not found in sendTicketConfirmationEmail', async () => {
      const tickets = [mockTicket];
      const event = {
        _id: '507f1f77bcf86cd799439012',
        name: 'Test Event',
      };
      const userId = '507f1f77bcf86cd799439013';

      userService.findOne.mockResolvedValue(null);

      await service.sendTicketConfirmationEmail(tickets, event, userId);

      expect(userService.findOne).toHaveBeenCalledWith(userId);
    });

    it('should handle successful email sending', async () => {
      const tickets = [mockTicket];
      const event = {
        _id: '507f1f77bcf86cd799439012',
        name: 'Test Event',
      };
      const userId = '507f1f77bcf86cd799439013';

      const mockUser = {
        _id: '507f1f77bcf86cd799439013',
        name: 'Test User',
        email: 'test@example.com',
      };

      userService.findOne.mockResolvedValue(mockUser);
      emailService.sendTicketConfirmationEmail.mockResolvedValue(true);

      await service.sendTicketConfirmationEmail(tickets, event, userId);

      expect(emailService.sendTicketConfirmationEmail).toHaveBeenCalledWith({
        userEmail: 'test@example.com',
        userName: 'Test User',
        event: event,
        tickets: tickets,
        totalAmount: 1000,
      });
    });

    it('should handle email sending failure', async () => {
      const tickets = [mockTicket];
      const event = {
        _id: '507f1f77bcf86cd799439012',
        name: 'Test Event',
      };
      const userId = '507f1f77bcf86cd799439013';

      const mockUser = {
        _id: '507f1f77bcf86cd799439013',
        name: 'Test User',
        email: 'test@example.com',
      };

      userService.findOne.mockResolvedValue(mockUser);
      emailService.sendTicketConfirmationEmail.mockResolvedValue(false);

      await service.sendTicketConfirmationEmail(tickets, event, userId);

      expect(emailService.sendTicketConfirmationEmail).toHaveBeenCalledWith({
        userEmail: 'test@example.com',
        userName: 'Test User',
        event: event,
        tickets: tickets,
        totalAmount: 1000,
      });
    });

    it('should handle error in sendTicketConfirmationEmail and rethrow', async () => {
      const tickets = [mockTicket];
      const event = {
        _id: '507f1f77bcf86cd799439012',
        name: 'Test Event',
      };
      const userId = '507f1f77bcf86cd799439013';

      const mockUser = {
        _id: '507f1f77bcf86cd799439013',
        name: 'Test User',
        email: 'test@example.com',
      };

      userService.findOne.mockResolvedValue(mockUser);
      emailService.sendTicketConfirmationEmail.mockRejectedValue(new Error('Email service error'));

      await expect(service.sendTicketConfirmationEmail(tickets, event, userId))
        .rejects.toThrow('Email service error');
    });
  });

  describe('purchaseMultipleTickets', () => {
    const mockEvent = {
      _id: '507f1f77bcf86cd799439012',
      name: 'Test Event',
      ticketTypes: [
        { type: 'general', price: 1000, available: 10 },
        { type: 'vip', price: 2000, available: 5 },
        { type: 'jubilados', price: 500, available: 3 },
        { type: 'niños', price: 500, available: 3 }
      ]
    };

    const purchaseMultipleTicketsDto: PurchaseMultipleTicketsDto = {
      tickets: [
        {
          eventId: '507f1f77bcf86cd799439012',
          userId: '507f1f77bcf86cd799439013',
          type: 'general',
          quantity: 2
        },
        {
          eventId: '507f1f77bcf86cd799439012',
          userId: '507f1f77bcf86cd799439013',
          type: 'vip',
          quantity: 1
        }
      ]
    };

    beforeEach(() => {
      eventInventoryService.validateEventForTicketPurchase.mockResolvedValue(mockEvent);
      eventInventoryService.checkTicketAvailability.mockResolvedValue(true);
      eventInventoryService.updateTicketCount.mockResolvedValue(undefined);
      repository.create.mockResolvedValue(mockTicket);
    });

    it('should purchase multiple tickets successfully', async () => {
      const result = await service.purchaseMultipleTickets(purchaseMultipleTicketsDto);

      expect(result).toHaveLength(3);
      expect(eventInventoryService.validateEventForTicketPurchase).toHaveBeenCalledTimes(3); // 2 calls during processing + 1 for email
      expect(eventInventoryService.checkTicketAvailability).toHaveBeenCalledTimes(2);
      expect(repository.create).toHaveBeenCalledTimes(3);
      expect(eventInventoryService.updateTicketCount).toHaveBeenCalledTimes(2);
    });

    it('should throw error when no tickets provided', async () => {
      const emptyDto: PurchaseMultipleTicketsDto = { tickets: [] };

      await expect(service.purchaseMultipleTickets(emptyDto))
        .rejects.toThrow('At least one ticket must be specified');
    });

    it('should throw error when tickets array is null', async () => {
      const nullDto: PurchaseMultipleTicketsDto = { tickets: null as any };

      await expect(service.purchaseMultipleTickets(nullDto))
        .rejects.toThrow('At least one ticket must be specified');
    });

    it('should throw error when total quantity exceeds 10', async () => {
      const excessiveDto: PurchaseMultipleTicketsDto = {
        tickets: [
          {
            eventId: '507f1f77bcf86cd799439012',
            userId: '507f1f77bcf86cd799439013',
            type: 'general',
            quantity: 8
          },
          {
            eventId: '507f1f77bcf86cd799439012',
            userId: '507f1f77bcf86cd799439013',
            type: 'vip',
            quantity: 5
          }
        ]
      };

      await expect(service.purchaseMultipleTickets(excessiveDto))
        .rejects.toThrow('Total quantity cannot exceed 10 tickets per purchase');
    });

    it('should throw error when individual quantity is less than 1', async () => {
      const invalidDto: PurchaseMultipleTicketsDto = {
        tickets: [
          {
            eventId: '507f1f77bcf86cd799439012',
            userId: '507f1f77bcf86cd799439013',
            type: 'general',
            quantity: 0
          }
        ]
      };

      await expect(service.purchaseMultipleTickets(invalidDto))
        .rejects.toThrow('Quantity must be between 1 and 10 for each ticket type');
    });

    it('should throw error when individual quantity is more than 10', async () => {
      const invalidDto: PurchaseMultipleTicketsDto = {
        tickets: [
          {
            eventId: '507f1f77bcf86cd799439012',
            userId: '507f1f77bcf86cd799439013',
            type: 'general',
            quantity: 11
          }
        ]
      };

      await expect(service.purchaseMultipleTickets(invalidDto))
        .rejects.toThrow('Total quantity cannot exceed 10 tickets per purchase');
    });

    it('should throw error when tickets are not available', async () => {
      eventInventoryService.checkTicketAvailability.mockResolvedValue(false);
      eventInventoryService.getTicketAvailability.mockResolvedValue(1);

      await expect(service.purchaseMultipleTickets(purchaseMultipleTicketsDto))
        .rejects.toThrow(InsufficientTicketsException);
    });

    it('should throw error when ticket type is not available for event', async () => {
      const invalidEvent = {
        ...mockEvent,
        ticketTypes: [
          { type: 'general', price: 1000, available: 10 }
        ]
      };
      eventInventoryService.validateEventForTicketPurchase.mockResolvedValue(invalidEvent);

      const invalidDto: PurchaseMultipleTicketsDto = {
        tickets: [
          {
            eventId: '507f1f77bcf86cd799439012',
            userId: '507f1f77bcf86cd799439013',
            type: 'vip',
            quantity: 1
          }
        ]
      };

      await expect(service.purchaseMultipleTickets(invalidDto))
        .rejects.toThrow('Ticket type vip not available for this event');
    });

    it('should handle email sending failure gracefully', async () => {
      const mockUser = {
        _id: '507f1f77bcf86cd799439013',
        name: 'Test User',
        email: 'test@example.com',
      };

      userService.findOne.mockResolvedValue(mockUser);
      emailService.sendTicketConfirmationEmail.mockRejectedValue(new Error('Email failed'));

      const result = await service.purchaseMultipleTickets(purchaseMultipleTicketsDto);

      expect(result).toHaveLength(3);
      expect(repository.create).toHaveBeenCalledTimes(3);
      // Should not throw error even if email fails
    });

    it('should create tickets with correct data structure', async () => {
      await service.purchaseMultipleTickets(purchaseMultipleTicketsDto);

      expect(repository.create).toHaveBeenCalledWith({
        eventId: expect.any(Object),
        userId: expect.any(Object),
        ticketType: 'general',
        price: 1000,
        status: 'active'
      });

      expect(repository.create).toHaveBeenCalledWith({
        eventId: expect.any(Object),
        userId: expect.any(Object),
        ticketType: 'vip',
        price: 2000,
        status: 'active'
      });
    });
  });

  describe('markAsUsed', () => {
    it('should mark ticket as used successfully', async () => {
      const usedTicket = { ...mockTicket, status: 'used' };
      repository.findById.mockResolvedValue(mockTicket);
      repository.markAsUsed.mockResolvedValue(usedTicket);

      const result = await service.markAsUsed('507f1f77bcf86cd799439011');

      expect(result).toEqual(usedTicket);
      expect(repository.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(repository.markAsUsed).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should throw error when ticket not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.markAsUsed('507f1f77bcf86cd799439011'))
        .rejects.toThrow('Ticket not found');
    });

    it('should throw error when ticket is not active', async () => {
      const inactiveTicket = { ...mockTicket, status: 'cancelled' };
      repository.findById.mockResolvedValue(inactiveTicket);

      await expect(service.markAsUsed('507f1f77bcf86cd799439011'))
        .rejects.toThrow('Ticket is not active');
    });

    it('should throw error when repository returns null on update', async () => {
      repository.findById.mockResolvedValue(mockTicket);
      repository.markAsUsed.mockResolvedValue(null);

      await expect(service.markAsUsed('507f1f77bcf86cd799439011'))
        .rejects.toThrow('Ticket not found');
    });
  });

  describe('cancelTicket', () => {
    it('should cancel ticket successfully', async () => {
      const cancelledTicket = { ...mockTicket, status: 'cancelled' };
      repository.findById.mockResolvedValue(mockTicket);
      repository.cancelTicket.mockResolvedValue(cancelledTicket);

      const result = await service.cancelTicket('507f1f77bcf86cd799439011', 'User requested');

      expect(result).toEqual(cancelledTicket);
      expect(repository.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(repository.cancelTicket).toHaveBeenCalledWith('507f1f77bcf86cd799439011', 'User requested');
    });

    it('should cancel ticket without reason', async () => {
      const cancelledTicket = { ...mockTicket, status: 'cancelled' };
      repository.findById.mockResolvedValue(mockTicket);
      repository.cancelTicket.mockResolvedValue(cancelledTicket);

      const result = await service.cancelTicket('507f1f77bcf86cd799439011');

      expect(result).toEqual(cancelledTicket);
      expect(repository.cancelTicket).toHaveBeenCalledWith('507f1f77bcf86cd799439011', undefined);
    });

    it('should throw error when ticket not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.cancelTicket('507f1f77bcf86cd799439011'))
        .rejects.toThrow('Ticket not found');
    });

    it('should throw error when ticket is not active', async () => {
      const inactiveTicket = { ...mockTicket, status: 'used' };
      repository.findById.mockResolvedValue(inactiveTicket);

      await expect(service.cancelTicket('507f1f77bcf86cd799439011'))
        .rejects.toThrow('Ticket is not active');
    });

    it('should throw error when repository returns null on update', async () => {
      repository.findById.mockResolvedValue(mockTicket);
      repository.cancelTicket.mockResolvedValue(null);

      await expect(service.cancelTicket('507f1f77bcf86cd799439011'))
        .rejects.toThrow('Ticket not found');
    });
  });

  describe('getUsersWithActiveTicketsForEvent', () => {
    it('should return users with active tickets for an event', async () => {
      const eventId = '507f1f77bcf86cd799439012';
      const mockTickets = [
        { ...mockTicket, userId: '507f1f77bcf86cd799439013', ticketType: 'general' },
        { ...mockTicket, userId: '507f1f77bcf86cd799439013', ticketType: 'vip' },
        { ...mockTicket, userId: '507f1f77bcf86cd799439014', ticketType: 'general' },
        { ...mockTicket, userId: '507f1f77bcf86cd799439015', ticketType: 'general', status: 'used' },
      ];

      repository.findByEvent.mockResolvedValue(mockTickets);
      userService.findOne
        .mockResolvedValueOnce({ _id: '507f1f77bcf86cd799439013', email: 'user1@test.com', name: 'User 1' })
        .mockResolvedValueOnce({ _id: '507f1f77bcf86cd799439014', email: 'user2@test.com', name: 'User 2' });

      const result = await service.getUsersWithActiveTicketsForEvent(eventId);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        userId: '507f1f77bcf86cd799439013',
        userEmail: 'user1@test.com',
        userName: 'User 1',
        ticketCount: 2,
        ticketTypes: ['general', 'vip'],
      });
      expect(result[1]).toEqual({
        userId: '507f1f77bcf86cd799439014',
        userEmail: 'user2@test.com',
        userName: 'User 2',
        ticketCount: 1,
        ticketTypes: ['general'],
      });
      expect(repository.findByEvent).toHaveBeenCalledWith(eventId);
    });

    it('should return empty array when no active tickets found', async () => {
      const eventId = '507f1f77bcf86cd799439012';
      const mockTickets = [
        { ...mockTicket, status: 'used' },
        { ...mockTicket, status: 'cancelled' },
      ];

      repository.findByEvent.mockResolvedValue(mockTickets);

      const result = await service.getUsersWithActiveTicketsForEvent(eventId);

      expect(result).toEqual([]);
      expect(repository.findByEvent).toHaveBeenCalledWith(eventId);
    });

    it('should handle error and return empty array', async () => {
      const eventId = '507f1f77bcf86cd799439012';
      repository.findByEvent.mockRejectedValue(new Error('Database error'));

      const result = await service.getUsersWithActiveTicketsForEvent(eventId);

      expect(result).toEqual([]);
    });
  });
});
