import { Injectable, Logger } from '@nestjs/common';
import { Ticket } from '../../tickets/schemas/ticket.schema';
import { EmailAttachment } from '../interfaces/email.interface';

@Injectable()
export class EmailAttachmentService {
  private readonly logger = new Logger(EmailAttachmentService.name);

  /**
   * Obtiene el código QR de un ticket
   */
  getQRCodeFromTicket(ticket: Ticket): string {
    const qrCode = (ticket as any).qrCode || '';
    this.logger.log(`QR for ticket ${(ticket as any)._id}: ${qrCode ? 'Available' : 'Not available'}`);
    if (qrCode) {
      this.logger.log(`QR length: ${qrCode.length} characters`);
    }
    return qrCode;
  }

  /**
   * Convierte un código QR en formato base64 a un buffer
   */
  private convertQRCodeToBuffer(qrCodeDataURL: string): Buffer {
    const base64Data = qrCodeDataURL.replace(/^data:image\/png;base64,/, '');
    return Buffer.from(base64Data, 'base64');
  }

  /**
   * Crea un attachment para un código QR
   */
  private createQRAttachment(ticket: Ticket): EmailAttachment | null {
    const qrCodeDataURL = this.getQRCodeFromTicket(ticket);
    
    if (!qrCodeDataURL) {
      return null;
    }

    const buffer = this.convertQRCodeToBuffer(qrCodeDataURL);
    
    return {
      filename: `qr-ticket-${(ticket as any)._id}.png`,
      content: buffer,
      cid: `qr-${(ticket as any)._id}`,
      contentType: 'image/png'
    };
  }

  /**
   * Crea attachments para todos los códigos QR de los tickets
   */
  createQRAttachments(tickets: Ticket[]): EmailAttachment[] {
    this.logger.log(`Creating QR attachments for ${tickets.length} tickets`);
    
    const attachments: EmailAttachment[] = [];
    
    tickets.forEach((ticket, index) => {
      const attachment = this.createQRAttachment(ticket);
      if (attachment) {
        attachments.push(attachment);
        this.logger.log(`Created QR attachment for ticket ${(ticket as any)._id}`);
      } else {
        this.logger.warn(`No QR code available for ticket ${(ticket as any)._id}`);
      }
    });

    this.logger.log(`Created ${attachments.length} QR attachments out of ${tickets.length} tickets`);
    return attachments;
  }

  /**
   * Valida si un ticket tiene código QR disponible
   */
  hasQRCode(ticket: Ticket): boolean {
    const qrCode = this.getQRCodeFromTicket(ticket);
    return !!qrCode;
  }

  /**
   * Obtiene el CID (Content ID) para un ticket específico
   */
  getQRCID(ticket: Ticket): string {
    return `qr-${(ticket as any)._id}`;
  }
}
