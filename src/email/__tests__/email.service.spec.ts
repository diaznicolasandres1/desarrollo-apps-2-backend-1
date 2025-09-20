import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email.service';

// Mock nodemailer
jest.mock('nodemailer', () => {
  const mockTransporter = {
    sendMail: jest.fn(),
    verify: jest.fn(),
  };
  
  return {
    createTransporter: jest.fn().mockReturnValue(mockTransporter),
    createTransport: jest.fn().mockReturnValue(mockTransporter),
    createTestAccount: jest.fn().mockResolvedValue({
      user: 'test@ethereal.email',
      pass: 'testpass',
      smtp: { host: 'smtp.ethereal.email', port: 587, secure: false },
      imap: { host: 'imap.ethereal.email', port: 993, secure: true },
      pop3: { host: 'pop3.ethereal.email', port: 995, secure: true },
      web: 'https://ethereal.email'
    }),
  };
});

describe('EmailService', () => {
  let service: EmailService;
  let configService: jest.Mocked<ConfigService>;
  let mockTransporter: any;

  beforeEach(async () => {
    // Get the mocked transporter
    const nodemailer = require('nodemailer');
    mockTransporter = nodemailer.createTransporter();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              const config = {
                EMAIL_USER: 'test@example.com',
                EMAIL_PASS: 'testpass',
                EMAIL_HOST: 'smtp.example.com',
                EMAIL_PORT: '587',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendTicketConfirmationEmail', () => {
    it('should send ticket confirmation email successfully', async () => {
      const mockTickets = [
        {
          _id: '507f1f77bcf86cd799439011',
          ticketType: 'general',
          price: 1000,
          qrCode: 'data:image/png;base64,test',
          validationURL: 'https://example.com/validate',
        },
      ];

      const mockEvent = {
        _id: '507f1f77bcf86cd799439012',
        name: 'Test Event',
        description: 'Test Description',
        date: '2025-12-31T20:00:00.000Z',
        time: '20:00',
      };

      const mockUser = {
        _id: '507f1f77bcf86cd799439013',
        name: 'Test User',
        email: 'test@example.com',
      };

      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-message-id' });

      const result = await service.sendTicketConfirmationEmail({
        tickets: mockTickets,
        event: mockEvent,
        user: mockUser,
      });

      expect(result).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalled();
    });

    it('should handle email sending failure', async () => {
      const mockTickets = [
        {
          _id: '507f1f77bcf86cd799439011',
          ticketType: 'general',
          price: 1000,
          qrCode: 'data:image/png;base64,test',
          validationURL: 'https://example.com/validate',
        },
      ];

      const mockEvent = {
        _id: '507f1f77bcf86cd799439012',
        name: 'Test Event',
        description: 'Test Description',
        date: '2025-12-31T20:00:00.000Z',
        time: '20:00',
      };

      const mockUser = {
        _id: '507f1f77bcf86cd799439013',
        name: 'Test User',
        email: 'test@example.com',
      };

      mockTransporter.sendMail.mockRejectedValue(new Error('Email failed'));

      const result = await service.sendTicketConfirmationEmail({
        tickets: mockTickets,
        event: mockEvent,
        user: mockUser,
      });

      expect(result).toBe(false);
    });
  });

  describe('sendEventModificationEmail', () => {
    it('should send event modification email for date change', async () => {
      const mockEvent = {
        _id: '507f1f77bcf86cd799439012',
        name: 'Test Event',
        description: 'Test Description',
        date: '2025-12-31T20:00:00.000Z',
        time: '20:00',
      };

      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-message-id' });

      const result = await service.sendEventModificationEmail({
        userEmail: 'test@example.com',
        userName: 'Test User',
        event: mockEvent,
        modificationType: 'date_change',
        oldValue: '30/12/2025',
        newValue: '31/12/2025',
        ticketCount: 2,
        ticketTypes: ['general', 'vip'],
      });

      expect(result).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@example.com',
          subject: expect.stringContaining('Cambio de Fecha'),
          html: expect.stringContaining('Test Event'),
        })
      );
    });

    it('should send event modification email for time change', async () => {
      const mockEvent = {
        _id: '507f1f77bcf86cd799439012',
        name: 'Test Event',
        description: 'Test Description',
        date: '2025-12-31T20:00:00.000Z',
        time: '21:00',
      };

      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-message-id' });

      const result = await service.sendEventModificationEmail({
        userEmail: 'test@example.com',
        userName: 'Test User',
        event: mockEvent,
        modificationType: 'time_change',
        oldValue: '20:00',
        newValue: '21:00',
        ticketCount: 1,
        ticketTypes: ['general'],
      });

      expect(result).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@example.com',
          subject: expect.stringContaining('Cambio de Hora'),
        })
      );
    });

    it('should send event modification email for date_time_change', async () => {
      const mockEvent = {
        _id: '507f1f77bcf86cd799439012',
        name: 'Test Event',
        description: 'Test Description',
        date: '2025-12-31T20:00:00.000Z',
        time: '21:00',
      };

      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-message-id' });

      const result = await service.sendEventModificationEmail({
        userEmail: 'test@example.com',
        userName: 'Test User',
        event: mockEvent,
        modificationType: 'date_time_change',
        oldValue: '30/12/2025 a las 20:00',
        newValue: '31/12/2025 a las 21:00',
        ticketCount: 3,
        ticketTypes: ['general', 'vip', 'jubilados'],
      });

      expect(result).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@example.com',
          subject: expect.stringContaining('Cambio de Fecha y Hora'),
        })
      );
    });

    it('should send event modification email for location change', async () => {
      const mockEvent = {
        _id: '507f1f77bcf86cd799439012',
        name: 'Test Event',
        description: 'Test Description',
        date: '2025-12-31T20:00:00.000Z',
        time: '20:00',
      };

      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-message-id' });

      const result = await service.sendEventModificationEmail({
        userEmail: 'test@example.com',
        userName: 'Test User',
        event: mockEvent,
        modificationType: 'location_change',
        oldValue: 'Teatro Recoleta',
        newValue: 'Carpe Diem',
        ticketCount: 1,
        ticketTypes: ['general'],
      });

      expect(result).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@example.com',
          subject: expect.stringContaining('Nueva Ubicación'),
        })
      );
    });

    it('should send event modification email for activation', async () => {
      const mockEvent = {
        _id: '507f1f77bcf86cd799439012',
        name: 'Test Event',
        description: 'Test Description',
        date: '2025-12-31T20:00:00.000Z',
        time: '20:00',
      };

      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-message-id' });

      const result = await service.sendEventModificationEmail({
        userEmail: 'test@example.com',
        userName: 'Test User',
        event: mockEvent,
        modificationType: 'activation',
        oldValue: 'Inactivo',
        newValue: 'Activo',
        ticketCount: 2,
        ticketTypes: ['general', 'vip'],
      });

      expect(result).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@example.com',
          subject: expect.stringContaining('Evento Reactivado'),
        })
      );
    });
  });

  describe('sendEventCancellationEmail', () => {
    it('should send event cancellation email successfully', async () => {
      const mockEvent = {
        _id: '507f1f77bcf86cd799439012',
        name: 'Test Event',
        description: 'Test Description',
        date: '2025-12-31T20:00:00.000Z',
        time: '20:00',
      };

      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-message-id' });

      const result = await service.sendEventCancellationEmail({
        userEmail: 'test@example.com',
        userName: 'Test User',
        event: mockEvent,
        ticketCount: 2,
        ticketTypes: ['general', 'vip'],
        cancellationReason: 'El evento ha sido cancelado por el organizador.',
      });

      expect(result).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@example.com',
          subject: expect.stringContaining('Evento Cancelado'),
          html: expect.stringContaining('Test Event'),
        })
      );
    });

    it('should send event cancellation email without reason', async () => {
      const mockEvent = {
        _id: '507f1f77bcf86cd799439012',
        name: 'Test Event',
        description: 'Test Description',
        date: '2025-12-31T20:00:00.000Z',
        time: '20:00',
      };

      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-message-id' });

      const result = await service.sendEventCancellationEmail({
        userEmail: 'test@example.com',
        userName: 'Test User',
        event: mockEvent,
        ticketCount: 1,
        ticketTypes: ['general'],
      });

      expect(result).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@example.com',
          subject: expect.stringContaining('Evento Cancelado'),
        })
      );
    });
  });

  describe('getModificationSubject', () => {
    it('should return correct subject for date_change', () => {
      const subject = (service as any).getModificationSubject('date_change', 'Test Event');
      expect(subject).toBe('⚠️ Cambio de Fecha - Test Event');
    });

    it('should return correct subject for time_change', () => {
      const subject = (service as any).getModificationSubject('time_change', 'Test Event');
      expect(subject).toBe('⚠️ Cambio de Hora - Test Event');
    });

    it('should return correct subject for date_time_change', () => {
      const subject = (service as any).getModificationSubject('date_time_change', 'Test Event');
      expect(subject).toBe('⚠️ Cambio de Fecha y Hora - Test Event');
    });

    it('should return correct subject for location_change', () => {
      const subject = (service as any).getModificationSubject('location_change', 'Test Event');
      expect(subject).toBe('📍 Nueva Ubicación - Test Event');
    });

    it('should return correct subject for activation', () => {
      const subject = (service as any).getModificationSubject('activation', 'Test Event');
      expect(subject).toBe('✅ Evento Reactivado - Test Event');
    });

    it('should return default subject for unknown type', () => {
      const subject = (service as any).getModificationSubject('unknown_type', 'Test Event');
      expect(subject).toBe('📢 Actualización - Test Event');
    });
  });
});