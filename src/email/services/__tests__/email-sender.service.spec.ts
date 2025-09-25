import { Test, TestingModule } from '@nestjs/testing';
import { EmailSenderService } from '../email-sender.service';
import { EmailConfigService } from '../email-config.service';

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

describe('EmailSenderService', () => {
  let service: EmailSenderService;
  let emailConfigService: jest.Mocked<EmailConfigService>;
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

    // Mock sendMail to simulate successful email sending
    mockTransporter.sendMail.mockResolvedValue({
      messageId: 'test-message-id',
      accepted: ['test@example.com'],
      rejected: [],
      pending: [],
      response: '250 OK'
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailSenderService,
        {
          provide: EmailConfigService,
          useValue: {
            createTransporter: jest.fn().mockReturnValue(mockTransporter),
            getSenderEmail: jest.fn().mockReturnValue('noreply@test.com'),
          },
        },
      ],
    }).compile();

    service = module.get<EmailSenderService>(EmailSenderService);
    emailConfigService = module.get(EmailConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete process.env.EMAIL_USER;
    delete process.env.EMAIL_PASS;
    delete process.env.EMAIL_HOST;
    delete process.env.EMAIL_PORT;
    delete process.env.EMAIL_FROM;
  });

  describe('sendEmail', () => {
    it('should send email successfully', async () => {
      const emailData = {
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<html>Test HTML</html>',
      };

      const result = await service.sendEmail(emailData);

      expect(result).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: 'noreply@test.com',
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<html>Test HTML</html>',
        attachments: [],
      });
    });

    it('should send email with attachments', async () => {
      const emailData = {
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<html>Test HTML</html>',
      };

      const attachments = [
        {
          filename: 'test.png',
          content: 'test-content',
          cid: 'test-cid',
          contentType: 'image/png'
        }
      ];

      const result = await service.sendEmail(emailData, attachments);

      expect(result).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: 'noreply@test.com',
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<html>Test HTML</html>',
        attachments: attachments,
      });
    });

    it('should handle email sending failure', async () => {
      mockTransporter.sendMail.mockRejectedValue(new Error('SMTP Error'));

      const emailData = {
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<html>Test HTML</html>',
      };

      const result = await service.sendEmail(emailData);

      expect(result).toBe(false);
      expect(mockTransporter.sendMail).toHaveBeenCalled();
    });

    it('should log email sending attempt', async () => {
      const emailData = {
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<html>Test HTML</html>',
      };

      const logSpy = jest.spyOn(service['logger'], 'log');

      await service.sendEmail(emailData);

      expect(logSpy).toHaveBeenCalledWith('Attempting to send email to: test@example.com');
      expect(logSpy).toHaveBeenCalledWith('Subject: Test Subject');
      expect(logSpy).toHaveBeenCalledWith('From: noreply@test.com');
      expect(logSpy).toHaveBeenCalledWith('To: test@example.com');
      expect(logSpy).toHaveBeenCalledWith('Email sent successfully: test-message-id');
    });

    it('should log attachments count when present', async () => {
      const emailData = {
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<html>Test HTML</html>',
      };

      const attachments = [
        { filename: 'test1.png', content: 'test1' },
        { filename: 'test2.png', content: 'test2' }
      ];

      const logSpy = jest.spyOn(service['logger'], 'log');

      await service.sendEmail(emailData, attachments);

      expect(logSpy).toHaveBeenCalledWith('Attachments: 2 files');
    });
  });

  describe('sendTicketConfirmationEmail', () => {
    it('should send ticket confirmation email', async () => {
      const emailData = {
        to: 'test@example.com',
        subject: 'Ticket Confirmation',
        html: '<html>Ticket HTML</html>',
      };

      const attachments = [
        {
          filename: 'qr-ticket-123.png',
          content: 'qr-content',
          cid: 'qr-123',
          contentType: 'image/png'
        }
      ];

      const result = await service.sendTicketConfirmationEmail(emailData, attachments);

      expect(result).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: 'noreply@test.com',
        to: 'test@example.com',
        subject: 'Ticket Confirmation',
        html: '<html>Ticket HTML</html>',
        attachments: attachments,
      });
    });
  });

  describe('sendEventModificationEmail', () => {
    it('should send event modification email', async () => {
      const emailData = {
        to: 'test@example.com',
        subject: 'Event Modified',
        html: '<html>Modification HTML</html>',
      };

      const result = await service.sendEventModificationEmail(emailData);

      expect(result).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: 'noreply@test.com',
        to: 'test@example.com',
        subject: 'Event Modified',
        html: '<html>Modification HTML</html>',
        attachments: [],
      });
    });
  });

  describe('sendEventCancellationEmail', () => {
    it('should send event cancellation email', async () => {
      const emailData = {
        to: 'test@example.com',
        subject: 'Event Cancelled',
        html: '<html>Cancellation HTML</html>',
      };

      const result = await service.sendEventCancellationEmail(emailData);

      expect(result).toBe(true);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: 'noreply@test.com',
        to: 'test@example.com',
        subject: 'Event Cancelled',
        html: '<html>Cancellation HTML</html>',
        attachments: [],
      });
    });
  });

  describe('verifyConnection', () => {
    it('should verify connection successfully', async () => {
      mockTransporter.verify.mockResolvedValue(true);

      const result = await service.verifyConnection();

      expect(result).toBe(true);
      expect(mockTransporter.verify).toHaveBeenCalled();
    });

    it('should handle connection verification failure', async () => {
      mockTransporter.verify.mockRejectedValue(new Error('Connection failed'));

      const result = await service.verifyConnection();

      expect(result).toBe(false);
      expect(mockTransporter.verify).toHaveBeenCalled();
    });
  });
});
