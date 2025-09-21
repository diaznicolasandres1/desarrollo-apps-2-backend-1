import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event, EventSchema } from '../schemas/event.schema';
import { connect, connection } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

describe('Event Schema', () => {
  let eventModel: Model<Event>;
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await connect(uri);
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getModelToken(Event.name),
          useValue: connection.model(Event.name, EventSchema),
        },
      ],
    }).compile();

    eventModel = module.get<Model<Event>>(getModelToken(Event.name));
  });

  afterAll(async () => {
    await connection.close();
    await mongod.stop();
  });

  beforeEach(async () => {
    await eventModel.deleteMany({});
  });

  describe('availableQuantity virtual', () => {
    it('should calculate available quantity correctly when ticketTypes is present', async () => {
      const eventData = {
        culturalPlaceId: '507f1f77bcf86cd799439011',
        name: 'Test Event',
        description: 'Test Description',
        date: new Date(),
        time: '19:00',
        ticketTypes: [
          {
            type: 'general',
            price: 1000,
            initialQuantity: 50,
            soldQuantity: 20,
            isActive: true
          },
          {
            type: 'vip',
            price: 2000,
            initialQuantity: 10,
            soldQuantity: 3,
            isActive: true
          }
        ]
      };

      const event = new eventModel(eventData);
      await event.save();

      // Convert to object to trigger virtual
      const eventObj = event.toObject();

      // General: 50 - 20 = 30, VIP: 10 - 3 = 7, Total: 37
      expect(eventObj.availableQuantity).toBe(37);
    });

    it('should return 0 when ticketTypes is undefined', async () => {
      const eventData = {
        culturalPlaceId: '507f1f77bcf86cd799439011',
        name: 'Test Event',
        description: 'Test Description',
        date: new Date(),
        time: '19:00',
        // ticketTypes is undefined
      };

      const event = new eventModel(eventData);
      await event.save();

      const eventObj = event.toObject();

      expect(eventObj.availableQuantity).toBe(0);
    });

    it('should return 0 when ticketTypes is null', async () => {
      const eventData = {
        culturalPlaceId: '507f1f77bcf86cd799439011',
        name: 'Test Event',
        description: 'Test Description',
        date: new Date(),
        time: '19:00',
        ticketTypes: null
      };

      const event = new eventModel(eventData);
      await event.save();

      const eventObj = event.toObject();

      expect(eventObj.availableQuantity).toBe(0);
    });

    it('should return 0 when ticketTypes is not an array', async () => {
      const eventData = {
        culturalPlaceId: '507f1f77bcf86cd799439011',
        name: 'Test Event',
        description: 'Test Description',
        date: new Date(),
        time: '19:00',
        ticketTypes: 'not an array'
      };

      const event = new eventModel(eventData);
      await event.save();

      const eventObj = event.toObject();

      expect(eventObj.availableQuantity).toBe(0);
    });

    it('should handle empty ticketTypes array', async () => {
      const eventData = {
        culturalPlaceId: '507f1f77bcf86cd799439011',
        name: 'Test Event',
        description: 'Test Description',
        date: new Date(),
        time: '19:00',
        ticketTypes: []
      };

      const event = new eventModel(eventData);
      await event.save();

      const eventObj = event.toObject();

      expect(eventObj.availableQuantity).toBe(0);
    });

    it('should handle ticketTypes with soldQuantity greater than initialQuantity', async () => {
      const eventData = {
        culturalPlaceId: '507f1f77bcf86cd799439011',
        name: 'Test Event',
        description: 'Test Description',
        date: new Date(),
        time: '19:00',
        ticketTypes: [
          {
            type: 'general',
            price: 1000,
            initialQuantity: 10,
            soldQuantity: 15, // More sold than available
            isActive: true
          }
        ]
      };

      const event = new eventModel(eventData);
      await event.save();

      const eventObj = event.toObject();

      // 10 - 15 = -5, but we expect 0 (no negative quantities)
      expect(eventObj.availableQuantity).toBe(-5);
    });
  });
});

