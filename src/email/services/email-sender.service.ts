import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { EmailData, EmailAttachment } from '../interfaces/email.interface';
import { EmailConfigService } from './email-config.service';

@Injectable()
export class EmailSenderService {
  private readonly logger = new Logger(EmailSenderService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly emailConfigService: EmailConfigService) {
    this.initializeTransporter();
  }

  /**
   * Inicializa el transporter de email
   */
  private initializeTransporter(): void {
    this.logger.log('Initializing EmailSenderService...');
    this.transporter = this.emailConfigService.createTransporter();
  }

  /**
   * Envía un email con los datos proporcionados
   */
  async sendEmail(emailData: EmailData, attachments?: EmailAttachment[]): Promise<boolean> {
    this.logger.log(`Attempting to send email to: ${emailData.to}`);
    this.logger.log(`Subject: ${emailData.subject}`);
    
    try {
      const senderEmail = this.emailConfigService.getSenderEmail();
      
      const mailOptions = {
        from: senderEmail,
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        attachments: attachments || []
      };

      this.logger.log(`From: ${mailOptions.from}`);
      this.logger.log(`To: ${mailOptions.to}`);
      if (attachments && attachments.length > 0) {
        this.logger.log(`Attachments: ${attachments.length} files`);
      }

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent successfully: ${info.messageId}`);
      
      return true;
    } catch (error) {
      this.logger.error('Error sending email:', error);
      return false;
    }
  }

  /**
   * Envía un email de confirmación de tickets
   */
  async sendTicketConfirmationEmail(
    emailData: EmailData, 
    attachments: EmailAttachment[]
  ): Promise<boolean> {
    this.logger.log(`Sending ticket confirmation email to: ${emailData.to}`);
    return this.sendEmail(emailData, attachments);
  }

  /**
   * Envía un email de modificación de evento
   */
  async sendEventModificationEmail(emailData: EmailData): Promise<boolean> {
    this.logger.log(`Sending event modification email to: ${emailData.to}`);
    return this.sendEmail(emailData);
  }

  /**
   * Envía un email de cancelación de evento
   */
  async sendEventCancellationEmail(emailData: EmailData): Promise<boolean> {
    this.logger.log(`Sending event cancellation email to: ${emailData.to}`);
    return this.sendEmail(emailData);
  }

  /**
   * Verifica la conexión del transporter
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      this.logger.log('Email transporter connection verified');
      return true;
    } catch (error) {
      this.logger.error('Email transporter connection failed:', error);
      return false;
    }
  }
}
