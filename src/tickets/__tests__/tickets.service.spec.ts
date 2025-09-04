import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TicketsService } from '../tickets.service';
import type { TicketRepository } from '../interfaces/ticket.repository.interface';
import { TICKET_REPOSITORY } from '../interfaces/ticket.repository.token';
import { PurchaseTicketDto } from '../dto/purchase-ticket.dto';
import { UpdateTicketDto } from '../dto/update-ticket.dto';
import { EventsService } from '../../events/events.service';

describe('TicketsService', () => {
  let service: TicketsService;
  let repository: jest.Mocked<TicketRepository>;
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
          provide: EventsService,
          useValue: {
            validateEventForTicketPurchase: jest.fn(),
            checkTicketAvailability: jest.fn(),
            getTicketAvailability: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TicketsService>(TicketsService);
    repository = module.get(TICKET_REPOSITORY);
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
      
      // Mock EventsService methods
      const eventsService = module.get(EventsService) as jest.Mocked<EventsService>;
      eventsService.validateEventForTicketPurchase.mockResolvedValue(mockEvent);
      eventsService.checkTicketAvailability.mockResolvedValue(true);
      eventsService.getTicketAvailability.mockResolvedValue(5);
      
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
      
      // Mock EventsService methods
      const eventsService = module.get(EventsService) as jest.Mocked<EventsService>;
      eventsService.validateEventForTicketPurchase.mockResolvedValue(mockEvent);
      eventsService.checkTicketAvailability.mockResolvedValue(true);
      eventsService.getTicketAvailability.mockResolvedValue(5);
      
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
      expect(repository.findByUser).toHaveBeenCalledWith('507f1f77bcf86cd799439013');
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
        total: 3,
        active: 1,
        used: 1,
        cancelled: 1,
        byType: {
          general: 2,
          vip: 1,
          jubilados: 0,
          niños: 0,
        },
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

      // Mock EventsService methods
      const eventsService = module.get(EventsService) as jest.Mocked<EventsService>;
      eventsService.validateEventForTicketPurchase.mockResolvedValue(mockEvent);
      eventsService.checkTicketAvailability.mockResolvedValue(true);
      eventsService.getTicketAvailability.mockResolvedValue(3);

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
});
