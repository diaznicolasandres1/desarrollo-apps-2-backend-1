import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { EmailConfig } from '../interfaces/email.interface';

@Injectable()
export class EmailConfigService {
  private readonly logger = new Logger(EmailConfigService.name);

  /**
   * Valida que las variables de entorno requeridas estén configuradas
   */
  validateEmailConfiguration(): void {
    this.logger.log('Validating email configuration...');
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      this.logger.error('EMAIL_USER and EMAIL_PASS environment variables are required');
      throw new Error('Incomplete email configuration. EMAIL_USER and EMAIL_PASS are required.');
    }

    this.logger.log('Email configuration validation passed');
  }

  /**
   * Crea la configuración del transporter de email
   */
  createEmailConfig(): EmailConfig {
    this.validateEmailConfiguration();
    
    this.logger.log('Creating email configuration...');
    
    return {
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER!,
        pass: process.env.EMAIL_PASS!,
      },
    };
  }

  /**
   * Crea y configura el transporter de nodemailer
   */
  createTransporter(): nodemailer.Transporter {
    const config = this.createEmailConfig();
    
    this.logger.log('Configuring transporter with provided credentials');
    
    const transporter = nodemailer.createTransport(config);

    // Verificar la configuración
    transporter.verify((error, success) => {
      if (error) {
        this.logger.error('Email configuration error:', error);
        throw new Error(`Email configuration error: ${error.message}`);
      } else {
        this.logger.log('Email server configured successfully');
      }
    });

    return transporter;
  }

  /**
   * Obtiene la dirección de email del remitente
   */
  getSenderEmail(): string {
    return process.env.EMAIL_FROM || process.env.EMAIL_USER || '';
  }
}
