import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MongoDBTicketRepository } from '../mongodb-ticket.repository';
import { Ticket, TicketDocument } from '../../schemas/ticket.schema';

describe('MongoDBTicketRepository', () => {
  let repository: MongoDBTicketRepository;
  let model: Model<TicketDocument>;

  const mockTicket = {
    _id: '507f1f77bcf86cd799439013',
    eventId: '507f1f77bcf86cd799439012',
    userId: '507f1f77bcf86cd799439011',
    ticketType: 'general',
    price: 100,
    status: 'active',
    usedAt: null,
    cancelledAt: null,
    cancellationReason: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    // Crear un mock que funcione como constructor
    const MockModel = jest.fn().mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(mockTicket),
    }));

    // Agregar métodos estáticos al mock
    (MockModel as any).find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockTicket]),
      }),
    });
    (MockModel as any).findById = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockTicket),
    });
    (MockModel as any).findByIdAndUpdate = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockTicket),
    });
    (MockModel as any).findByIdAndDelete = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockTicket),
    });
    (MockModel as any).countDocuments = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(5),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MongoDBTicketRepository,
        {
          provide: getModelToken(Ticket.name),
          useValue: MockModel,
        },
      ],
    }).compile();

    repository = module.get<MongoDBTicketRepository>(MongoDBTicketRepository);
    model = module.get<Model<TicketDocument>>(getModelToken(Ticket.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create a new ticket', async () => {
      const createTicketDto = {
        eventId: '507f1f77bcf86cd799439012',
        userId: '507f1f77bcf86cd799439011',
        ticketType: 'general',
        price: 100,
        status: 'active',
        isActive: true,
      };

      const result = await repository.create(createTicketDto);

      expect(model).toHaveBeenCalledWith(createTicketDto);
      expect(result).toEqual(mockTicket);
    });
  });

  describe('findAll', () => {
    it('should find all tickets without filters', async () => {
      const result = await repository.findAll();

      expect(model.find).toHaveBeenCalledWith({});
      expect(result).toEqual([mockTicket]);
    });

    it('should find tickets with eventId filter', async () => {
      const query = { eventId: '507f1f77bcf86cd799439012' };

      const result = await repository.findAll(query);

      expect(model.find).toHaveBeenCalledWith({
        eventId: new Types.ObjectId('507f1f77bcf86cd799439012'),
      });
      expect(result).toEqual([mockTicket]);
    });
  });

  describe('findById', () => {
    it('should find a ticket by id', async () => {
      const ticketId = '507f1f77bcf86cd799439013';

      const result = await repository.findById(ticketId);

      expect(model.findById).toHaveBeenCalledWith(ticketId);
      expect(result).toEqual(mockTicket);
    });
  });

  describe('update', () => {
    it('should update a ticket', async () => {
      const ticketId = '507f1f77bcf86cd799439013';
      const updateTicketDto = {
        status: 'used',
        usedAt: new Date(),
      };

      const result = await repository.update(ticketId, updateTicketDto);

      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(ticketId, updateTicketDto, { new: true });
      expect(result).toEqual(mockTicket);
    });
  });

  describe('delete', () => {
    it('should delete a ticket and return true', async () => {
      const ticketId = '507f1f77bcf86cd799439013';

      const result = await repository.delete(ticketId);

      expect(model.findByIdAndDelete).toHaveBeenCalledWith(ticketId);
      expect(result).toBe(true);
    });
  });

  describe('markAsUsed', () => {
    it('should mark ticket as used', async () => {
      const ticketId = '507f1f77bcf86cd799439013';

      const result = await repository.markAsUsed(ticketId);

      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        ticketId,
        {
          status: 'used',
          usedAt: expect.any(Date),
        },
        { new: true }
      );
      expect(result).toEqual(mockTicket);
    });
  });

  describe('cancelTicket', () => {
    it('should cancel a ticket with reason', async () => {
      const ticketId = '507f1f77bcf86cd799439013';
      const reason = 'Event cancelled';

      const result = await repository.cancelTicket(ticketId, reason);

      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        ticketId,
        {
          status: 'cancelled',
          cancelledAt: expect.any(Date),
          cancellationReason: reason,
        },
        { new: true }
      );
      expect(result).toEqual(mockTicket);
    });
  });

  describe('countByEventAndType', () => {
    it('should count tickets by event and type', async () => {
      const eventId = '507f1f77bcf86cd799439012';
      const ticketType = 'general';

      const result = await repository.countByEventAndType(eventId, ticketType);

      expect(model.countDocuments).toHaveBeenCalledWith({
        eventId: new Types.ObjectId(eventId),
        ticketType,
        status: 'active',
      });
      expect(result).toBe(5);
    });
  });

  describe('findByUser', () => {
    it('should find tickets by user without options', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockTicket]),
      };
      
      (model.find as jest.Mock).mockReturnValue(mockQuery);

      const result = await repository.findByUser(userId);

      expect(model.find).toHaveBeenCalledWith({ userId: new Types.ObjectId(userId) });
      expect(mockQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(mockQuery.exec).toHaveBeenCalled();
      expect(result).toEqual([mockTicket]);
    });

    it('should find tickets by user with populate options', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const options = {
        populate: [
          {
            path: 'eventId',
            select: '_id name description date time',
            populate: {
              path: 'culturalPlaceId',
              select: '_id name contact.address contact.image'
            }
          }
        ]
      };
      
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockTicket]),
      };
      
      (model.find as jest.Mock).mockReturnValue(mockQuery);

      const result = await repository.findByUser(userId, options);

      expect(model.find).toHaveBeenCalledWith({ userId: new Types.ObjectId(userId) });
      expect(mockQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(mockQuery.populate).toHaveBeenCalledWith({
        path: 'eventId',
        select: '_id name description date time image',
        populate: {
          path: 'culturalPlaceId',
          select: '_id name contact.address contact.image'
        }
      });
      expect(mockQuery.exec).toHaveBeenCalled();
      expect(result).toEqual([mockTicket]);
    });

    it('should find tickets by user with options but no populate', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const options = { someOtherOption: true };
      
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockTicket]),
      };
      
      (model.find as jest.Mock).mockReturnValue(mockQuery);

      const result = await repository.findByUser(userId, options);

      expect(model.find).toHaveBeenCalledWith({ userId: new Types.ObjectId(userId) });
      expect(mockQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(mockQuery.exec).toHaveBeenCalled();
      expect(result).toEqual([mockTicket]);
    });
  });
});
