import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { TicketValidator } from '../ticket.validator';

describe('TicketValidator', () => {
  let service: TicketValidator;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TicketValidator],
    }).compile();

    service = module.get<TicketValidator>(TicketValidator);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateTicketTypes', () => {
    it('should validate ticket types successfully', () => {
      const ticketTypes = [
        {
          type: 'general',
          price: 1000,
          initialQuantity: 100,
        },
        {
          type: 'vip',
          price: 2000,
          initialQuantity: 50,
        }
      ];

      expect(() => service.validateTicketTypes(ticketTypes)).not.toThrow();
    });

    it('should throw BadRequestException when no ticket types provided', () => {
      expect(() => service.validateTicketTypes([])).toThrow(BadRequestException);
      expect(() => service.validateTicketTypes([])).toThrow('At least one ticket type is required');
    });

    it('should throw BadRequestException for null ticket types', () => {
      expect(() => service.validateTicketTypes(null as any)).toThrow(BadRequestException);
      expect(() => service.validateTicketTypes(null as any)).toThrow('At least one ticket type is required');
    });

    it('should throw BadRequestException for duplicate ticket types', () => {
      const ticketTypes = [
        {
          type: 'general',
          price: 1000,
          initialQuantity: 100,
        },
        {
          type: 'general',
          price: 2000,
          initialQuantity: 50,
        }
      ];

      expect(() => service.validateTicketTypes(ticketTypes)).toThrow(BadRequestException);
      expect(() => service.validateTicketTypes(ticketTypes)).toThrow('Duplicate ticket type: general');
    });

    it('should throw BadRequestException for negative price', () => {
      const ticketTypes = [
        {
          type: 'general',
          price: -100,
          initialQuantity: 100,
        }
      ];

      expect(() => service.validateTicketTypes(ticketTypes)).toThrow(BadRequestException);
      expect(() => service.validateTicketTypes(ticketTypes)).toThrow('Ticket price cannot be negative');
    });

    it('should throw BadRequestException for initial quantity less than 1', () => {
      const ticketTypes = [
        {
          type: 'general',
          price: 1000,
          initialQuantity: 0,
        }
      ];

      expect(() => service.validateTicketTypes(ticketTypes)).toThrow(BadRequestException);
      expect(() => service.validateTicketTypes(ticketTypes)).toThrow('Initial quantity must be at least 1');
    });
  });

  describe('validateTicketTypesPut', () => {
    it('should validate PUT ticket types successfully', () => {
      const ticketTypes = [
        {
          type: 'general',
          price: 1000,
          initialQuantity: 100,
          soldQuantity: 10,
        },
        {
          type: 'vip',
          price: 2000,
          initialQuantity: 50,
          soldQuantity: 5,
        }
      ];

      expect(() => service.validateTicketTypesPut(ticketTypes)).not.toThrow();
    });

    it('should throw BadRequestException when no ticket types provided for PUT', () => {
      expect(() => service.validateTicketTypesPut([])).toThrow(BadRequestException);
      expect(() => service.validateTicketTypesPut([])).toThrow('At least one ticket type is required');
    });

    it('should throw BadRequestException for duplicate ticket types in PUT', () => {
      const ticketTypes = [
        {
          type: 'general',
          price: 1000,
          initialQuantity: 100,
          soldQuantity: 10,
        },
        {
          type: 'general',
          price: 2000,
          initialQuantity: 50,
          soldQuantity: 5,
        }
      ];

      expect(() => service.validateTicketTypesPut(ticketTypes)).toThrow(BadRequestException);
      expect(() => service.validateTicketTypesPut(ticketTypes)).toThrow('Duplicate ticket type: general');
    });

    it('should throw BadRequestException for negative sold quantity', () => {
      const ticketTypes = [
        {
          type: 'general',
          price: 1000,
          initialQuantity: 100,
          soldQuantity: -5,
        }
      ];

      expect(() => service.validateTicketTypesPut(ticketTypes)).toThrow(BadRequestException);
      expect(() => service.validateTicketTypesPut(ticketTypes)).toThrow('Sold quantity cannot be negative');
    });

    it('should throw BadRequestException when sold quantity exceeds initial quantity', () => {
      const ticketTypes = [
        {
          type: 'general',
          price: 1000,
          initialQuantity: 100,
          soldQuantity: 150,
        }
      ];

      expect(() => service.validateTicketTypesPut(ticketTypes)).toThrow(BadRequestException);
      expect(() => service.validateTicketTypesPut(ticketTypes)).toThrow('Sold quantity cannot exceed initial quantity');
    });
  });
});
