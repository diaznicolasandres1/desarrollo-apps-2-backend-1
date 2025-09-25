import { Injectable, Logger } from '@nestjs/common';
import { 
  EmailData, 
  TicketPurchaseEmailData, 
  EventModificationEmailData, 
  EventCancellationEmailData 
} from './interfaces/email.interface';
import { EmailSenderService } from './services/email-sender.service';
import { EmailTemplateService } from './services/email-template.service';
import { EmailAttachmentService } from './services/email-attachment.service';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly emailSenderService: EmailSenderService,
    private readonly emailTemplateService: EmailTemplateService,
    private readonly emailAttachmentService: EmailAttachmentService,
  ) {}

  /**
   * Envía un email genérico
   */
  async sendEmail(emailData: EmailData, attachments?: any[]): Promise<boolean> {
    this.logger.log(`Sending generic email to: ${emailData.to}`);
    return this.emailSenderService.sendEmail(emailData, attachments);
  }

  /**
   * Envía un email de confirmación de tickets
   */
  async sendTicketConfirmationEmail(data: TicketPurchaseEmailData): Promise<boolean> {
    this.logger.log(`Sending ticket confirmation email to: ${data.userEmail}`);
    
    const subject = `Confirmación de compra de tickets - ${data.event.name}`;
    const html = this.emailTemplateService.generateTicketConfirmationHTML(data);
    const attachments = this.emailAttachmentService.createQRAttachments(data.tickets);

    return this.sendEmail({
      to: data.userEmail,
      subject,
      html,
    }, attachments);
  }

  /**
   * Envía emails de confirmación agrupados por evento
   * Útil para compras múltiples que incluyen tickets de diferentes eventos
   */
  async sendMultipleEventConfirmationEmails(
    tickets: any[],
    userEmail: string,
    userName: string,
    getEventData: (eventId: string) => Promise<any>
  ): Promise<void> {
    try {
      // Agrupar tickets por evento
      const ticketsByEvent = new Map<string, any[]>();
      
      for (const ticket of tickets) {
        const eventId = ticket.eventId.toString();
        if (!ticketsByEvent.has(eventId)) {
          ticketsByEvent.set(eventId, []);
        }
        ticketsByEvent.get(eventId)!.push(ticket);
      }

      // Enviar un email por cada evento
      for (const [eventId, eventTickets] of ticketsByEvent) {
        try {
          // Obtener datos del evento
          const event = await getEventData(eventId);
          
          // Calcular el total para este evento
          const totalAmount = eventTickets.reduce((sum, ticket) => sum + ticket.price, 0);

          // Preparar datos para el email
          const emailData = {
            userEmail,
            userName,
            event,
            tickets: eventTickets,
            totalAmount,
          };

          // Enviar email
          const emailSent = await this.sendTicketConfirmationEmail(emailData);
          
          if (emailSent) {
            this.logger.log(`Email de confirmación enviado exitosamente a ${userEmail} para el evento ${event.name}`);
          } else {
            this.logger.warn(`Error al enviar email de confirmación a ${userEmail} para el evento ${event.name}`);
          }
        } catch (error) {
          this.logger.error(`Error enviando email para el evento ${eventId}:`, error);
          // Continuar con el siguiente evento aunque este falle
        }
      }
    } catch (error) {
      this.logger.error('Error en sendMultipleEventConfirmationEmails:', error);
      throw error;
    }
  }

  /**
   * Envía un email de modificación de evento
   */
  async sendEventModificationEmail(data: EventModificationEmailData): Promise<boolean> {
    this.logger.log(`Sending event modification email to: ${data.userEmail}`);
    
    const subject = this.emailTemplateService.getModificationSubject(data.modificationType, data.event.name);
    const html = this.emailTemplateService.generateEventModificationHTML(data);

    return this.sendEmail({
      to: data.userEmail,
      subject,
      html,
    });
  }

  /**
   * Envía un email de cancelación de evento
   */
  async sendEventCancellationEmail(data: EventCancellationEmailData): Promise<boolean> {
    this.logger.log(`Sending event cancellation email to: ${data.userEmail}`);
    
    const subject = `❌ Evento Cancelado - ${data.event.name}`;
    const html = this.emailTemplateService.generateEventCancellationHTML(data);

    return this.sendEmail({
      to: data.userEmail,
      subject,
      html,
    });
  }
}