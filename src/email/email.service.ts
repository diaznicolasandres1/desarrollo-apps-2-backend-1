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