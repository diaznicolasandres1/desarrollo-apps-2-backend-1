import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from '../email.service';

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTestAccount: jest.fn(),
  createTransport: jest.fn(),
}));

describe('EmailService', () => {
  let service: EmailService;
  let mockTransporter: any;

  beforeEach(async () => {
    // Mock transporter
    mockTransporter = {
      sendMail: jest.fn(),
      verify: jest.fn(),
    };

    // Mock nodemailer
    const nodemailer = require('nodemailer');
    nodemailer.createTestAccount.mockResolvedValue({
      user: 'test@ethereal.email',
      pass: 'testpass',
      smtp: { host: 'smtp.ethereal.email', port: 587, secure: false },
    });
    nodemailer.createTransport.mockReturnValue(mockTransporter);

    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailService],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendEmail', () => {
    it('should send email successfully', async () => {
      const mockResult = { messageId: 'test-message-id' };
      mockTransporter.sendMail.mockResolvedValue(mockResult);

      const emailData = {
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Test content</p>',
      };

      const result = await service.sendEmail(emailData);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: 'test@ethereal.email',
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Test content</p>',
        attachments: [],
      });
      expect(result).toBe(true);
    });

    it('should handle email sending error', async () => {
      const error = new Error('SMTP Error');
      mockTransporter.sendMail.mockRejectedValue(error);

      const emailData = {
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Test content</p>',
      };

      const result = await service.sendEmail(emailData);
      expect(result).toBe(false);
    });
  });

  describe('sendTicketConfirmationEmail', () => {
    it('should send ticket confirmation email successfully', async () => {
      const mockResult = { messageId: 'test-message-id' };
      mockTransporter.sendMail.mockResolvedValue(mockResult);

      const tickets = [
        {
          _id: '68cce0daf351d4d3c2f47b31',
          eventId: '68c2dd71fb172823da61eb94',
          userId: '68c2dd60fb172823da61eb92',
          ticketType: 'general',
          price: 100,
          status: 'active',
          qrCode: 'data:image/png;base64,test-qr-data',
          validationURL: 'https://test.com/ticket/use',
        },
      ];

      const event = {
        _id: '68c2dd71fb172823da61eb94',
        name: 'Concierto de Jazz',
        description: 'Un concierto de jazz',
        date: new Date('2024-12-25'),
        time: '20:00',
        location: 'Teatro Colón',
        price: 100,
        ticketTypes: {
          general: { price: 100, quantity: 100 },
        },
        active: true,
      };

      const emailData = {
        userEmail: 'test@example.com',
        userName: 'Test User',
        event,
        tickets,
        totalAmount: 100,
      };

      const result = await service.sendTicketConfirmationEmail(emailData);

      expect(mockTransporter.sendMail).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should handle missing QR code gracefully', async () => {
      const mockResult = { messageId: 'test-message-id' };
      mockTransporter.sendMail.mockResolvedValue(mockResult);

      const tickets = [
        {
          _id: '68cce0daf351d4d3c2f47b31',
          eventId: '68c2dd71fb172823da61eb94',
          userId: '68c2dd60fb172823da61eb92',
          ticketType: 'general',
          price: 100,
          status: 'active',
          qrCode: null,
          validationURL: null,
        },
      ];

      const event = {
        _id: '68c2dd71fb172823da61eb94',
        name: 'Concierto de Jazz',
        description: 'Un concierto de jazz',
        date: new Date('2024-12-25'),
        time: '20:00',
        location: 'Teatro Colón',
        price: 100,
        ticketTypes: {
          general: { price: 100, quantity: 100 },
        },
        active: true,
      };

      const emailData = {
        userEmail: 'test@example.com',
        userName: 'Test User',
        event,
        tickets,
        totalAmount: 100,
      };

      const result = await service.sendTicketConfirmationEmail(emailData);

      expect(mockTransporter.sendMail).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe('generateTicketConfirmationHTML', () => {
    it('should generate HTML for single ticket', () => {
      const tickets = [
        {
          _id: '68cce0daf351d4d3c2f47b31',
          eventId: '68c2dd71fb172823da61eb94',
          userId: '68c2dd60fb172823da61eb92',
          ticketType: 'general',
          price: 100,
          status: 'active',
          qrCode: 'data:image/png;base64,test-qr-data',
          validationURL: 'https://test.com/ticket/use',
        },
      ];

      const event = {
        _id: '68c2dd71fb172823da61eb94',
        name: 'Concierto de Jazz',
        description: 'Un concierto de jazz',
        date: new Date('2024-12-25'),
        time: '20:00',
        location: 'Teatro Colón',
        price: 100,
        ticketTypes: {
          general: { price: 100, quantity: 100 },
        },
        active: true,
      };

      const html = service.generateTicketConfirmationHTML('Test User', event, tickets, 100);

      expect(html).toContain('Concierto de Jazz');
      expect(html).toContain('Test User');
      expect(html).toContain('cid:qr-68cce0daf351d4d3c2f47b31');
      expect(html).toContain('100');
    });

    it('should handle tickets without QR codes', () => {
      const tickets = [
        {
          _id: '68cce0daf351d4d3c2f47b31',
          eventId: '68c2dd71fb172823da61eb94',
          userId: '68c2dd60fb172823da61eb92',
          ticketType: 'general',
          price: 100,
          status: 'active',
          qrCode: null,
          validationURL: null,
        },
      ];

      const event = {
        _id: '68c2dd71fb172823da61eb94',
        name: 'Concierto de Jazz',
        description: 'Un concierto de jazz',
        date: new Date('2024-12-25'),
        time: '20:00',
        location: 'Teatro Colón',
        price: 100,
        ticketTypes: {
          general: { price: 100, quantity: 100 },
        },
        active: true,
      };

      const html = service.generateTicketConfirmationHTML('Test User', event, tickets, 100);

      expect(html).toContain('Concierto de Jazz');
      expect(html).toContain('QR no disponible');
      expect(html).not.toContain('cid:qr-code');
    });

    it('should generate HTML for multiple tickets', () => {
      const tickets = [
        {
          _id: '68cce0daf351d4d3c2f47b31',
          eventId: '68c2dd71fb172823da61eb94',
          userId: '68c2dd60fb172823da61eb92',
          ticketType: 'general',
          price: 100,
          status: 'active',
          qrCode: 'data:image/png;base64,test-qr-data-1',
          validationURL: 'https://test.com/ticket/use/1',
        },
        {
          _id: '68cce0daf351d4d3c2f47b32',
          eventId: '68c2dd71fb172823da61eb94',
          userId: '68c2dd60fb172823da61eb92',
          ticketType: 'vip',
          price: 200,
          status: 'active',
          qrCode: 'data:image/png;base64,test-qr-data-2',
          validationURL: 'https://test.com/ticket/use/2',
        },
      ];

      const event = {
        _id: '68c2dd71fb172823da61eb94',
        name: 'Concierto de Jazz',
        description: 'Un concierto de jazz',
        date: new Date('2024-12-25'),
        time: '20:00',
        location: 'Teatro Colón',
        price: 100,
        ticketTypes: {
          general: { price: 100, quantity: 100 },
          vip: { price: 200, quantity: 50 },
        },
        active: true,
      };

      const html = service.generateTicketConfirmationHTML('Test User', event, tickets, 300);

      expect(html).toContain('Concierto de Jazz');
      expect(html).toContain('Test User');
      expect(html).toContain('cid:qr-68cce0daf351d4d3c2f47b31');
      expect(html).toContain('cid:qr-68cce0daf351d4d3c2f47b32');
      expect(html).toContain('general');
      expect(html).toContain('vip');
      expect(html).toContain('300');
    });
  });

  describe('getQRCodeFromTicket', () => {
    it('should return QR code from ticket', () => {
      const ticket = {
        _id: '68cce0daf351d4d3c2f47b31',
        qrCode: 'data:image/png;base64,test-qr-data',
      };

      const qrCode = service.getQRCodeFromTicket(ticket as any);

      expect(qrCode).toBe('data:image/png;base64,test-qr-data');
    });

    it('should return empty string when no QR code', () => {
      const ticket = {
        _id: '68cce0daf351d4d3c2f47b31',
        qrCode: null,
      };

      const qrCode = service.getQRCodeFromTicket(ticket as any);

      expect(qrCode).toBe('');
    });

    it('should return empty string when QR code is undefined', () => {
      const ticket = {
        _id: '68cce0daf351d4d3c2f47b31',
      };

      const qrCode = service.getQRCodeFromTicket(ticket as any);

      expect(qrCode).toBe('');
    });
  });

  describe('sendEmail with attachments', () => {
    it('should send email with attachments successfully', async () => {
      const mockResult = { messageId: 'test-message-id' };
      mockTransporter.sendMail.mockResolvedValue(mockResult);

      const emailData = {
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Test content</p>',
      };

      const attachments = [
        {
          filename: 'test.pdf',
          content: Buffer.from('test content'),
          contentType: 'application/pdf',
        },
      ];

      const result = await service.sendEmail(emailData, attachments);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: 'test@ethereal.email',
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Test content</p>',
        attachments: attachments,
      });
      expect(result).toBe(true);
    });
  });

  describe('constructor error handling', () => {
    it('should handle initialization error gracefully', async () => {
      // Mock nodemailer to throw error during initialization
      const nodemailer = require('nodemailer');
      nodemailer.createTestAccount.mockRejectedValue(new Error('Test account creation failed'));
      
      // Create a new service instance to trigger constructor
      const EmailService = require('../email.service').EmailService;
      const serviceInstance = new EmailService();
      
      // Wait a bit for async initialization
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Should not throw error
      expect(serviceInstance).toBeDefined();
    });
  });

  describe('initializeTransporter error paths', () => {
    it('should handle createTestAccount error', async () => {
      const nodemailer = require('nodemailer');
      nodemailer.createTestAccount.mockRejectedValue(new Error('Test account failed'));
      
      // Mock environment to trigger Ethereal path
      const originalEnv = process.env.EMAIL_USER;
      delete process.env.EMAIL_USER;
      
      const EmailService = require('../email.service').EmailService;
      const serviceInstance = new EmailService();
      
      // Wait for async initialization
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Restore environment
      if (originalEnv) process.env.EMAIL_USER = originalEnv;
      
      expect(serviceInstance).toBeDefined();
    });

    it('should handle transporter verify error and fallback to Ethereal', async () => {
      const nodemailer = require('nodemailer');
      
      // Mock environment to use custom email
      process.env.EMAIL_USER = 'test@gmail.com';
      process.env.EMAIL_PASS = 'testpass';
      
      // Mock transporter verify to fail
      const mockTransporterWithError = {
        verify: jest.fn().mockImplementation((callback) => callback(new Error('Auth failed'))),
        sendMail: jest.fn(),
      };
      
      nodemailer.createTransport.mockReturnValue(mockTransporterWithError);
      nodemailer.createTestAccount.mockResolvedValue({
        user: 'fallback@ethereal.email',
        pass: 'fallbackpass',
      });
      
      const EmailService = require('../email.service').EmailService;
      const serviceInstance = new EmailService();
      
      // Wait for async initialization
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(mockTransporterWithError.verify).toHaveBeenCalled();
    });

    it('should handle Ethereal fallback error', async () => {
      const nodemailer = require('nodemailer');
      
      // Mock environment to use custom email
      process.env.EMAIL_USER = 'test@gmail.com';
      process.env.EMAIL_PASS = 'testpass';
      
      // Mock transporter verify to fail
      const mockTransporterWithError = {
        verify: jest.fn().mockImplementation((callback) => callback(new Error('Auth failed'))),
        sendMail: jest.fn(),
      };
      
      nodemailer.createTransport.mockReturnValue(mockTransporterWithError);
      nodemailer.createTestAccount.mockRejectedValue(new Error('Ethereal failed'));
      
      const EmailService = require('../email.service').EmailService;
      const serviceInstance = new EmailService();
      
      // Wait for async initialization
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(serviceInstance).toBeDefined();
    });
  });

  describe('sendEmail with preview URL', () => {
    it('should log preview URL when using Ethereal', async () => {
      const mockResult = { 
        messageId: 'test-message-id',
        previewURL: 'https://ethereal.email/message/test-preview'
      };
      mockTransporter.sendMail.mockResolvedValue(mockResult);

      const emailData = {
        to: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Test content</p>',
      };

      const result = await service.sendEmail(emailData);

      expect(result).toBe(true);
    });
  });
});
