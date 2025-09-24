import { Test, TestingModule } from '@nestjs/testing';
import { TicketsController } from '../tickets.controller';
import { TicketsService } from '../tickets.service';
import { PurchaseTicketDto } from '../dto/purchase-ticket.dto';
import { PurchaseMultipleTicketsDto } from '../dto/purchase-multiple-tickets.dto';
import { UpdateTicketDto } from '../dto/update-ticket.dto';

describe('TicketsController', () => {
  let controller: TicketsController;
  let service: jest.Mocked<TicketsService>;

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

  const mockService = {
    purchaseTicket: jest.fn(),
    purchaseMultipleTickets: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByEvent: jest.fn(),
    findByUser: jest.fn(),
    findByUserWithEventDetails: jest.fn(),
    findByEventAndUser: jest.fn(),
    findByStatus: jest.fn(),
    findActiveTickets: jest.fn(),
    getTicketStats: jest.fn(),
    update: jest.fn(),
    markAsUsed: jest.fn(),
    cancelTicket: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TicketsController],
      providers: [
        {
          provide: TicketsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<TicketsController>(TicketsController);
    service = module.get(TicketsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('purchaseMultipleTickets', () => {
    const purchaseMultipleTicketsDto: PurchaseMultipleTicketsDto = {
      tickets: [
        {
          eventId: '507f1f77bcf86cd799439012',
          userId: '507f1f77bcf86cd799439013',
          type: 'general',
          quantity: 2,
        },
        {
          eventId: '507f1f77bcf86cd799439012',
          userId: '507f1f77bcf86cd799439013',
          type: 'jubilados',
          quantity: 1,
        }
      ]
    };

    it('should purchase multiple tickets successfully', async () => {
      const tickets = [mockTicket, { ...mockTicket, _id: '507f1f77bcf86cd799439014' }];
      service.purchaseMultipleTickets.mockResolvedValue(tickets);

      const result = await controller.purchaseMultipleTickets(purchaseMultipleTicketsDto);

      expect(result).toEqual(tickets);
      expect(service.purchaseMultipleTickets).toHaveBeenCalledWith(purchaseMultipleTicketsDto);
    });
  });

  describe('findAll', () => {
    it('should return all tickets', async () => {
      const tickets = [mockTicket];
      service.findAll.mockResolvedValue(tickets);

      const result = await controller.findAll();

      expect(result).toEqual(tickets);
      expect(service.findAll).toHaveBeenCalledWith(undefined);
    });

    it('should return filtered tickets', async () => {
      const tickets = [mockTicket];
      const query = { eventId: '507f1f77bcf86cd799439012' };
      service.findAll.mockResolvedValue(tickets);

      const result = await controller.findAll(query);

      expect(result).toEqual(tickets);
      expect(service.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('findActiveTickets', () => {
    it('should return active tickets', async () => {
      const tickets = [mockTicket];
      service.findActiveTickets.mockResolvedValue(tickets);

      const result = await controller.findActiveTickets();

      expect(result).toEqual(tickets);
      expect(service.findActiveTickets).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a ticket by id', async () => {
      service.findOne.mockResolvedValue(mockTicket);

      const result = await controller.findOne('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockTicket);
      expect(service.findOne).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });
  });

  describe('findByEvent', () => {
    it('should return tickets for an event', async () => {
      const tickets = [mockTicket];
      service.findByEvent.mockResolvedValue(tickets);

      const result = await controller.findByEvent('507f1f77bcf86cd799439012');

      expect(result).toEqual(tickets);
      expect(service.findByEvent).toHaveBeenCalledWith('507f1f77bcf86cd799439012');
    });
  });

  describe('findByUser', () => {
    it('should return tickets for a user with event details', async () => {
      const fixedDate = new Date('2025-12-25T19:00:00.000Z');
      const ticketsWithEventDetails = [{
        _id: mockTicket._id,
        eventId: {
          _id: '507f1f77bcf86cd799439012',
          name: 'Test Event',
          description: 'Test Description',
          date: '2025-12-25', // Solo la fecha YYYY-MM-DD
          time: '19:00',
          image: 'https://example.com/event-image.jpg',
          culturalPlaceId: {
            _id: '507f1f77bcf86cd799439014',
            name: 'Test Cultural Place',
            address: 'Test Address', // Directamente address
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
      }];
      service.findByUserWithEventDetails.mockResolvedValue(ticketsWithEventDetails);

      const result = await controller.findByUser('507f1f77bcf86cd799439013');

      expect(result).toEqual(ticketsWithEventDetails);
      expect(service.findByUserWithEventDetails).toHaveBeenCalledWith('507f1f77bcf86cd799439013');
    });
  });

  describe('findByEventAndUser', () => {
    it('should return tickets for event and user', async () => {
      const tickets = [mockTicket];
      service.findByEventAndUser.mockResolvedValue(tickets);

      const result = await controller.findByEventAndUser('507f1f77bcf86cd799439012', '507f1f77bcf86cd799439013');

      expect(result).toEqual(tickets);
      expect(service.findByEventAndUser).toHaveBeenCalledWith('507f1f77bcf86cd799439012', '507f1f77bcf86cd799439013');
    });
  });

  describe('findByStatus', () => {
    it('should return tickets by status', async () => {
      const tickets = [mockTicket];
      service.findByStatus.mockResolvedValue(tickets);

      const result = await controller.findByStatus('active');

      expect(result).toEqual(tickets);
      expect(service.findByStatus).toHaveBeenCalledWith('active');
    });
  });

  describe('getTicketStats', () => {
    it('should return ticket statistics for an event', async () => {
      const stats = {
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
      };
      service.getTicketStats.mockResolvedValue(stats);

      const result = await controller.getTicketStats('507f1f77bcf86cd799439012');

      expect(result).toEqual(stats);
      expect(service.getTicketStats).toHaveBeenCalledWith('507f1f77bcf86cd799439012');
    });
  });

  describe('update', () => {
    const updateTicketDto: UpdateTicketDto = {
      ticketType: 'vip',
      price: 2000,
    };

    it('should update a ticket successfully', async () => {
      const updatedTicket = { ...mockTicket, ...updateTicketDto };
      service.update.mockResolvedValue(updatedTicket);

      const result = await controller.update('507f1f77bcf86cd799439011', updateTicketDto);

      expect(result).toEqual(updatedTicket);
      expect(service.update).toHaveBeenCalledWith('507f1f77bcf86cd799439011', updateTicketDto);
    });
  });

  describe('markAsUsed', () => {
    it('should mark ticket as used successfully', async () => {
      const usedTicket = { ...mockTicket, status: 'used', usedAt: new Date() };
      service.markAsUsed.mockResolvedValue(usedTicket);

      const result = await controller.markAsUsed('507f1f77bcf86cd799439011');

      expect(result).toEqual(usedTicket);
      expect(service.markAsUsed).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
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
      service.cancelTicket.mockResolvedValue(cancelledTicket);

      const result = await controller.cancelTicket('507f1f77bcf86cd799439011', { reason: 'Event cancelled' });

      expect(result).toEqual(cancelledTicket);
      expect(service.cancelTicket).toHaveBeenCalledWith('507f1f77bcf86cd799439011', 'Event cancelled');
    });

    it('should cancel ticket without reason', async () => {
      const cancelledTicket = { 
        ...mockTicket, 
        status: 'cancelled', 
        cancelledAt: new Date()
      };
      service.cancelTicket.mockResolvedValue(cancelledTicket);

      const result = await controller.cancelTicket('507f1f77bcf86cd799439011', {});

      expect(result).toEqual(cancelledTicket);
      expect(service.cancelTicket).toHaveBeenCalledWith('507f1f77bcf86cd799439011', undefined);
    });
  });

  describe('remove', () => {
    it('should remove a ticket successfully', async () => {
      service.remove.mockResolvedValue(undefined);

      await controller.remove('507f1f77bcf86cd799439011');

      expect(service.remove).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });
  });
});
