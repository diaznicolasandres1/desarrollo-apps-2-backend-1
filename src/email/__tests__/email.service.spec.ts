import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from '../email.service';
import { EmailSenderService } from '../services/email-sender.service';
import { EmailTemplateService } from '../services/email-template.service';
import { EmailAttachmentService } from '../services/email-attachment.service';

// Mock nodemailer
jest.mock('nodemailer', () => {
  const mockTransporter = {
    sendMail: jest.fn(),
    verify: jest.fn(),
  };
  
  return {
    createTransport: jest.fn().mockReturnValue(mockTransporter),
  };
});

describe('EmailService', () => {
  let service: EmailService;
  let emailSenderService: jest.Mocked<EmailSenderService>;
  let emailTemplateService: jest.Mocked<EmailTemplateService>;
  let emailAttachmentService: jest.Mocked<EmailAttachmentService>;
  let mockTransporter: any;

  beforeEach(async () => {
    // Set up environment variables for testing
    process.env.EMAIL_USER = 'test@example.com';
    process.env.EMAIL_PASS = 'testpass';
    process.env.EMAIL_HOST = 'smtp.example.com';
    process.env.EMAIL_PORT = '587';
    process.env.EMAIL_FROM = 'noreply@test.com';

    // Get the mocked transporter
    const nodemailer = require('nodemailer');
    mockTransporter = nodemailer.createTransport();
    
    // Mock verify to simulate successful connection
    mockTransporter.verify.mockImplementation((callback: any) => {
      callback(null, true);
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: EmailSenderService,
          useValue: {
            sendEmail: jest.fn(),
          },
        },
        {
          provide: EmailTemplateService,
          useValue: {
            generateTicketConfirmationHTML: jest.fn(),
            generateEventModificationHTML: jest.fn(),
            generateEventCancellationHTML: jest.fn(),
            getModificationSubject: jest.fn(),
          },
        },
        {
          provide: EmailAttachmentService,
          useValue: {
            createQRAttachments: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    emailSenderService = module.get(EmailSenderService);
    emailTemplateService = module.get(EmailTemplateService);
    emailAttachmentService = module.get(EmailAttachmentService);
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
        },
      ];

      const mockEvent = {
        _id: '507f1f77bcf86cd799439012',
        name: 'Test Event',
        description: 'Test Description',
        date: '2025-12-31T20:00:00.000Z',
        time: '20:00',
      };

      emailTemplateService.generateTicketConfirmationHTML.mockReturnValue('<html>Test HTML</html>');
      emailAttachmentService.createQRAttachments.mockReturnValue([]);
      emailSenderService.sendEmail.mockResolvedValue(true);

      const result = await service.sendTicketConfirmationEmail({
        userEmail: 'test@example.com',
        userName: 'Test User',
        event: mockEvent,
        tickets: mockTickets,
        totalAmount: 1000,
      });

      expect(result).toBe(true);
      expect(emailTemplateService.generateTicketConfirmationHTML).toHaveBeenCalledWith({
        userEmail: 'test@example.com',
        userName: 'Test User',
        event: mockEvent,
        tickets: mockTickets,
        totalAmount: 1000,
      });
      expect(emailAttachmentService.createQRAttachments).toHaveBeenCalledWith(mockTickets);
      expect(emailSenderService.sendEmail).toHaveBeenCalled();
    });

    it('should handle email sending failure', async () => {
      const mockTickets = [
        {
          _id: '507f1f77bcf86cd799439011',
          ticketType: 'general',
          price: 1000,
          qrCode: 'data:image/png;base64,test',
        },
      ];

      const mockEvent = {
        _id: '507f1f77bcf86cd799439012',
        name: 'Test Event',
        description: 'Test Description',
        date: '2025-12-31T20:00:00.000Z',
        time: '20:00',
      };

      emailTemplateService.generateTicketConfirmationHTML.mockReturnValue('<html>Test HTML</html>');
      emailAttachmentService.createQRAttachments.mockReturnValue([]);
      emailSenderService.sendEmail.mockResolvedValue(false);

      const result = await service.sendTicketConfirmationEmail({
        userEmail: 'test@example.com',
        userName: 'Test User',
        event: mockEvent,
        tickets: mockTickets,
        totalAmount: 1000,
      });

      expect(result).toBe(false);
    });
  });

  describe('sendEventModificationEmail', () => {
    it('should send event modification email successfully', async () => {
      const mockEvent = {
        _id: '507f1f77bcf86cd799439012',
        name: 'Test Event',
        description: 'Test Description',
        date: '2025-12-31T20:00:00.000Z',
        time: '20:00',
      };

      emailTemplateService.getModificationSubject.mockReturnValue('⚠️ Cambio de Fecha - Test Event');
      emailTemplateService.generateEventModificationHTML.mockReturnValue('<html>Test HTML</html>');
      emailSenderService.sendEmail.mockResolvedValue(true);

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
      expect(emailTemplateService.getModificationSubject).toHaveBeenCalledWith('date_change', 'Test Event');
      expect(emailTemplateService.generateEventModificationHTML).toHaveBeenCalled();
      expect(emailSenderService.sendEmail).toHaveBeenCalled();
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

      emailTemplateService.generateEventCancellationHTML.mockReturnValue('<html>Test HTML</html>');
      emailSenderService.sendEmail.mockResolvedValue(true);

      const result = await service.sendEventCancellationEmail({
        userEmail: 'test@example.com',
        userName: 'Test User',
        event: mockEvent,
        ticketCount: 2,
        ticketTypes: ['general', 'vip'],
        cancellationReason: 'El evento ha sido cancelado por el organizador.',
      });

      expect(result).toBe(true);
      expect(emailTemplateService.generateEventCancellationHTML).toHaveBeenCalledWith({
        userEmail: 'test@example.com',
        userName: 'Test User',
        event: mockEvent,
        ticketCount: 2,
        ticketTypes: ['general', 'vip'],
        cancellationReason: 'El evento ha sido cancelado por el organizador.',
      });
      expect(emailSenderService.sendEmail).toHaveBeenCalled();
    });

    it('should send event cancellation email without reason', async () => {
      const mockEvent = {
        _id: '507f1f77bcf86cd799439012',
        name: 'Test Event',
        description: 'Test Description',
        date: '2025-12-31T20:00:00.000Z',
        time: '20:00',
      };

      emailTemplateService.generateEventCancellationHTML.mockReturnValue('<html>Test HTML</html>');
      emailSenderService.sendEmail.mockResolvedValue(true);

      const result = await service.sendEventCancellationEmail({
        userEmail: 'test@example.com',
        userName: 'Test User',
        event: mockEvent,
        ticketCount: 1,
        ticketTypes: ['general'],
      });

      expect(result).toBe(true);
      expect(emailTemplateService.generateEventCancellationHTML).toHaveBeenCalledWith({
        userEmail: 'test@example.com',
        userName: 'Test User',
        event: mockEvent,
        ticketCount: 1,
        ticketTypes: ['general'],
        cancellationReason: undefined,
      });
    });
  });

  describe('sendEmail', () => {
    it('should send email successfully', async () => {
      emailSenderService.sendEmail.mockResolvedValue(true);

      const result = await service.sendEmail({
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<html>Test HTML</html>',
      });

      expect(result).toBe(true);
      expect(emailSenderService.sendEmail).toHaveBeenCalledWith(
        {
          to: 'test@example.com',
          subject: 'Test Subject',
          html: '<html>Test HTML</html>',
        },
        undefined
      );
    });

    it('should send email with attachments', async () => {
      const attachments = [{ filename: 'test.png', content: 'test' }];
      emailSenderService.sendEmail.mockResolvedValue(true);

      const result = await service.sendEmail({
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<html>Test HTML</html>',
      }, attachments);

      expect(result).toBe(true);
      expect(emailSenderService.sendEmail).toHaveBeenCalledWith(
        {
          to: 'test@example.com',
          subject: 'Test Subject',
          html: '<html>Test HTML</html>',
        },
        attachments
      );
    });
  });
});
