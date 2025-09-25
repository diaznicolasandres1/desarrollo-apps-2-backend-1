import { EmailAttachmentService } from '../email-attachment.service';
import { Ticket } from '../../../tickets/schemas/ticket.schema';

describe('EmailAttachmentService', () => {
  let service: EmailAttachmentService;

  beforeEach(() => {
    service = new EmailAttachmentService();
  });

  describe('getQRCodeFromTicket', () => {
    it('should return QR code from ticket', () => {
      const mockTicket = {
        _id: 'ticket123',
        ticketType: 'General',
        price: 100,
        qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
      } as any as Ticket;

      const qrCode = service.getQRCodeFromTicket(mockTicket);

      expect(qrCode).toBe('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==');
    });

    it('should return empty string if QR code is not available', () => {
      const mockTicket = {
        _id: 'ticket123',
        ticketType: 'General',
        price: 100,
        qrCode: null
      } as any as Ticket;

      const qrCode = service.getQRCodeFromTicket(mockTicket);

      expect(qrCode).toBe('');
    });

    it('should return empty string if QR code is undefined', () => {
      const mockTicket = {
        _id: 'ticket123',
        ticketType: 'General',
        price: 100
      } as any as Ticket;

      const qrCode = service.getQRCodeFromTicket(mockTicket);

      expect(qrCode).toBe('');
    });
  });

  describe('createQRAttachments', () => {
    it('should create attachments for tickets with QR codes', () => {
      const mockTickets = [
        {
          _id: 'ticket1',
          ticketType: 'General',
          price: 100,
          qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
        },
        {
          _id: 'ticket2',
          ticketType: 'VIP',
          price: 200,
          qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
        }
      ] as any as Ticket[];

      const attachments = service.createQRAttachments(mockTickets);

      expect(attachments).toHaveLength(2);
      expect(attachments[0]).toEqual({
        filename: 'qr-ticket-ticket1.png',
        content: expect.any(Buffer),
        cid: 'qr-ticket1',
        contentType: 'image/png'
      });
      expect(attachments[1]).toEqual({
        filename: 'qr-ticket-ticket2.png',
        content: expect.any(Buffer),
        cid: 'qr-ticket2',
        contentType: 'image/png'
      });
    });

    it('should skip tickets without QR codes', () => {
      const mockTickets = [
        {
          _id: 'ticket1',
          ticketType: 'General',
          price: 100,
          qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
        },
        {
          _id: 'ticket2',
          ticketType: 'VIP',
          price: 200,
          qrCode: null
        }
      ] as any as Ticket[];

      const attachments = service.createQRAttachments(mockTickets);

      expect(attachments).toHaveLength(1);
      expect(attachments[0].filename).toBe('qr-ticket-ticket1.png');
    });

    it('should return empty array if no tickets have QR codes', () => {
      const mockTickets = [
        {
          _id: 'ticket1',
          ticketType: 'General',
          price: 100,
          qrCode: null
        },
        {
          _id: 'ticket2',
          ticketType: 'VIP',
          price: 200,
          qrCode: undefined
        }
      ] as any as Ticket[];

      const attachments = service.createQRAttachments(mockTickets);

      expect(attachments).toHaveLength(0);
    });
  });

  describe('hasQRCode', () => {
    it('should return true if ticket has QR code', () => {
      const mockTicket = {
        _id: 'ticket123',
        ticketType: 'General',
        price: 100,
        qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
      } as any as Ticket;

      const hasQR = service.hasQRCode(mockTicket);

      expect(hasQR).toBe(true);
    });

    it('should return false if ticket has no QR code', () => {
      const mockTicket = {
        _id: 'ticket123',
        ticketType: 'General',
        price: 100,
        qrCode: null
      } as any as Ticket;

      const hasQR = service.hasQRCode(mockTicket);

      expect(hasQR).toBe(false);
    });

    it('should return false if ticket has empty QR code', () => {
      const mockTicket = {
        _id: 'ticket123',
        ticketType: 'General',
        price: 100,
        qrCode: ''
      } as any as Ticket;

      const hasQR = service.hasQRCode(mockTicket);

      expect(hasQR).toBe(false);
    });
  });

  describe('getQRCID', () => {
    it('should return correct CID for ticket', () => {
      const mockTicket = {
        _id: 'ticket123',
        ticketType: 'General',
        price: 100
      } as any as Ticket;

      const cid = service.getQRCID(mockTicket);

      expect(cid).toBe('qr-ticket123');
    });
  });
});
