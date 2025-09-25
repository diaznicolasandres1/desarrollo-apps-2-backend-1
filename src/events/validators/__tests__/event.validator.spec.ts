import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { EventValidator } from '../event.validator';

describe('EventValidator', () => {
  let service: EventValidator;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventValidator],
    }).compile();

    service = module.get<EventValidator>(EventValidator);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateEventData', () => {
    it('should validate event data successfully', () => {
      const createEventDto = {
        name: 'Test Event',
        description: 'Test Description',
        date: '2025-12-31T20:00:00.000Z',
        time: '20:00',
        culturalPlaceId: '507f1f77bcf86cd799439011',
        ticketTypes: [
          {
            type: 'general',
            price: 1000,
            initialQuantity: 100,
          }
        ]
      };

      expect(() => service.validateEventData(createEventDto)).not.toThrow();
    });

    it('should throw BadRequestException for past date', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      expect(() => service.validateEventDate(pastDate)).toThrow(BadRequestException);
      expect(() => service.validateEventDate(pastDate)).toThrow('Event date cannot be in the past');
    });

    it('should accept future date', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      expect(() => service.validateEventDate(futureDate)).not.toThrow();
    });
  });

  describe('validateEventTime', () => {
    it('should validate correct time format', () => {
      const validTimes = ['09:00', '9:00', '12:30', '18:45', '23:59'];

      validTimes.forEach(time => {
        expect(() => service.validateEventTime(time)).not.toThrow();
      });
    });

    it('should throw BadRequestException for invalid time format', () => {
      const invalidTimes = ['25:00', '12:60', '12-30', '12.30', ''];

      invalidTimes.forEach(time => {
        expect(() => service.validateEventTime(time)).toThrow(BadRequestException);
        expect(() => service.validateEventTime(time)).toThrow('Invalid time format. Use HH:MM format');
      });
    });

  });
});
