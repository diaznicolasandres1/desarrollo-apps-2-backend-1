import { EmailTemplateService } from '../email-template.service';
import { EmailAttachmentService } from '../email-attachment.service';
import { Ticket } from '../../../tickets/schemas/ticket.schema';
import { Event } from '../../../events/schemas/event.schema';
import { TicketPurchaseEmailData, EventModificationEmailData, EventCancellationEmailData } from '../../interfaces/email.interface';

describe('EmailTemplateService', () => {
  let service: EmailTemplateService;
  let mockAttachmentService: jest.Mocked<EmailAttachmentService>;

  beforeEach(() => {
    mockAttachmentService = {
      hasQRCode: jest.fn(),
      getQRCID: jest.fn(),
    } as any;

    service = new EmailTemplateService(mockAttachmentService);
  });

  describe('generateTicketConfirmationHTML', () => {
    it('should generate HTML for ticket confirmation', () => {
      const mockEvent = {
        _id: 'event123',
        name: 'Test Event',
        description: 'Test Description',
        date: '2024-01-01',
        time: '19:00'
      } as any as Event;

      const mockTickets = [
        {
          _id: 'ticket1',
          ticketType: 'General',
          price: 100
        },
        {
          _id: 'ticket2',
          ticketType: 'VIP',
          price: 200
        }
      ] as any as Ticket[];

      const data: TicketPurchaseEmailData = {
        userEmail: 'test@example.com',
        userName: 'John Doe',
        event: mockEvent,
        tickets: mockTickets,
        totalAmount: 300
      };

      mockAttachmentService.hasQRCode.mockReturnValue(true);
      mockAttachmentService.getQRCID.mockReturnValue('qr-ticket1');

      const html = service.generateTicketConfirmationHTML(data);

      expect(html).toContain('John Doe');
      expect(html).toContain('Test Event');
      expect(html).toContain('General');
      expect(html).toContain('VIP');
      expect(html).toContain('$300');
      expect(html).toContain('Confirmación de Reserva');
    });
  });

  describe('generateEventModificationHTML', () => {
    it('should generate HTML for date change modification', () => {
      const mockEvent = {
        _id: 'event123',
        name: 'Test Event',
        date: '2024-01-01',
        time: '19:00'
      };

      const data: EventModificationEmailData = {
        userEmail: 'test@example.com',
        userName: 'John Doe',
        event: mockEvent,
        modificationType: 'date_change',
        oldValue: '2024-01-01',
        newValue: '2024-01-15',
        ticketCount: 2,
        ticketTypes: ['General', 'VIP']
      };

      const html = service.generateEventModificationHTML(data);

      expect(html).toContain('John Doe');
      expect(html).toContain('Test Event');
      expect(html).toContain('Cambio Importante');
      expect(html).toContain('2024-01-01');
      expect(html).toContain('2024-01-15');
      expect(html).toContain('Cultural Places');
    });

    it('should generate HTML for location change modification', () => {
      const mockEvent = {
        _id: 'event123',
        name: 'Test Event',
        date: '2024-01-01',
        time: '19:00'
      };

      const data: EventModificationEmailData = {
        userEmail: 'test@example.com',
        userName: 'John Doe',
        event: mockEvent,
        modificationType: 'location_change',
        oldValue: { name: 'Old Venue' },
        newValue: { name: 'New Venue' },
        ticketCount: 1,
        ticketTypes: ['General']
      };

      const html = service.generateEventModificationHTML(data);

      expect(html).toContain('Old Venue');
      expect(html).toContain('New Venue');
      expect(html).toContain('Cambio Importante');
    });
  });

  describe('generateEventCancellationHTML', () => {
    it('should generate HTML for event cancellation', () => {
      const mockEvent = {
        _id: 'event123',
        name: 'Test Event',
        date: '2024-01-01',
        time: '19:00'
      };

      const data: EventCancellationEmailData = {
        userEmail: 'test@example.com',
        userName: 'John Doe',
        event: mockEvent,
        ticketCount: 2,
        ticketTypes: ['General', 'VIP'],
        cancellationReason: 'Weather conditions'
      };

      const html = service.generateEventCancellationHTML(data);

      expect(html).toContain('John Doe');
      expect(html).toContain('Test Event');
      expect(html).toContain('Weather conditions');
      expect(html).toContain('Evento Cancelado');
      expect(html).toContain('Cultural Places');
    });

    it('should generate HTML for event cancellation without reason', () => {
      const mockEvent = {
        _id: 'event123',
        name: 'Test Event',
        date: '2024-01-01',
        time: '19:00'
      };

      const data: EventCancellationEmailData = {
        userEmail: 'test@example.com',
        userName: 'John Doe',
        event: mockEvent,
        ticketCount: 1,
        ticketTypes: ['General']
      };

      const html = service.generateEventCancellationHTML(data);

      expect(html).toContain('John Doe');
      expect(html).toContain('Test Event');
      expect(html).not.toContain('Razón:');
      expect(html).toContain('Evento Cancelado');
    });
  });

  describe('getModificationSubject', () => {
    it('should return correct subject for date change', () => {
      const subject = service.getModificationSubject('date_change', 'Test Event');
      expect(subject).toBe('⚠️ Cambio de Fecha - Test Event');
    });

    it('should return correct subject for time change', () => {
      const subject = service.getModificationSubject('time_change', 'Test Event');
      expect(subject).toBe('⚠️ Cambio de Hora - Test Event');
    });

    it('should return correct subject for date_time change', () => {
      const subject = service.getModificationSubject('date_time_change', 'Test Event');
      expect(subject).toBe('⚠️ Cambio de Fecha y Hora - Test Event');
    });

    it('should return correct subject for location change', () => {
      const subject = service.getModificationSubject('location_change', 'Test Event');
      expect(subject).toBe('📍 Nueva Ubicación - Test Event');
    });

    it('should return correct subject for activation', () => {
      const subject = service.getModificationSubject('activation', 'Test Event');
      expect(subject).toBe('✅ Evento Reactivado - Test Event');
    });

    it('should return default subject for unknown modification type', () => {
      const subject = service.getModificationSubject('unknown_type', 'Test Event');
      expect(subject).toBe('📢 Actualización - Test Event');
    });
  });
});
