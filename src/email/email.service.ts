import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Ticket } from '../tickets/schemas/ticket.schema';
import { Event } from '../events/schemas/event.schema';

export interface EmailData {
  to: string;
  subject: string;
  html: string;
}

export interface TicketPurchaseEmailData {
  userEmail: string;
  userName: string;
  event: Event;
  tickets: Ticket[];
  totalAmount: number;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    // Inicializar de forma asíncrona
    this.initializeTransporter().catch(error => {
      this.logger.error('Error inicializando transporter:', error);
    });
  }

  private async initializeTransporter() {
    this.logger.log('🔧 Inicializando EmailService...');
    this.logger.log(`EMAIL_USER: ${process.env.EMAIL_USER ? 'Configurado' : 'No configurado'}`);
    this.logger.log(`EMAIL_PASS: ${process.env.EMAIL_PASS ? 'Configurado' : 'No configurado'}`);
    
    // Si no hay configuración de email O si hay error de autenticación, usar Ethereal para testing
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      this.logger.warn('⚠️  No hay configuración de email. Usando Ethereal Email para testing...');
      
      try {
        // Crear cuenta de prueba en Ethereal
        const testAccount = await nodemailer.createTestAccount();
        
        this.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });

        this.logger.log('✅ Configurado Ethereal Email para testing');
        this.logger.log(`📧 Usuario de prueba: ${testAccount.user}`);
        this.logger.log(`🔑 Contraseña de prueba: ${testAccount.pass}`);
        this.logger.log('🌐 Ve a https://ethereal.email para ver los emails enviados');
        
      } catch (error) {
        this.logger.error('Error creando cuenta de prueba:', error);
        return;
      }
    } else {
      // Configuración normal con Gmail u otro proveedor
      this.logger.log('📧 Usando configuración de email personalizada');
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: false, // true para 465, false para otros puertos
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    }

    // Verificar la configuración de conexión
    this.transporter.verify(async (error, success) => {
      if (error) {
        this.logger.error('❌ Error de configuración de email:', error);
        this.logger.warn('⚠️  Cambiando a Ethereal Email para testing...');
        
        // Si hay error de autenticación, cambiar a Ethereal
        try {
          const testAccount = await nodemailer.createTestAccount();
          this.transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
              user: testAccount.user,
              pass: testAccount.pass,
            },
          });
          
          this.logger.log('✅ Configurado Ethereal Email como fallback');
          this.logger.log(`📧 Usuario de prueba: ${testAccount.user}`);
          this.logger.log('🌐 Ve a https://ethereal.email para ver los emails enviados');
          
        } catch (etherealError) {
          this.logger.error('❌ Error configurando Ethereal:', etherealError);
        }
      } else {
        this.logger.log('✅ Servidor de email configurado correctamente');
      }
    });
  }

  async sendEmail(emailData: EmailData, attachments?: any[]): Promise<boolean> {
    this.logger.log(`📤 Intentando enviar email a: ${emailData.to}`);
    this.logger.log(`📋 Asunto: ${emailData.subject}`);
    
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'test@ethereal.email',
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        attachments: attachments || []
      };

      this.logger.log(`📧 From: ${mailOptions.from}`);
      this.logger.log(`📧 To: ${mailOptions.to}`);
      if (attachments && attachments.length > 0) {
        this.logger.log(`📎 Adjuntos: ${attachments.length} archivos`);
      }

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`✅ Email enviado exitosamente: ${info.messageId}`);
      
      // Si estamos usando Ethereal, mostrar la URL de preview
      if (info.previewURL) {
        this.logger.log(`🔗 Preview URL: ${info.previewURL}`);
        this.logger.log('🌐 Ve a esa URL para ver el email enviado');
      }
      
      return true;
    } catch (error) {
      this.logger.error('❌ Error al enviar email:', error);
      return false;
    }
  }

  async sendTicketConfirmationEmail(data: TicketPurchaseEmailData): Promise<boolean> {
    const { userEmail, userName, event, tickets, totalAmount } = data;

    const subject = `Confirmación de Reserva - ${event.name}`;
    const html = this.generateTicketConfirmationHTML(userName, event, tickets, totalAmount);

    // Crear adjuntos para los códigos QR
    const attachments: any[] = [];
    tickets.forEach((ticket, index) => {
      const qrCodeDataURL = this.getQRCodeFromTicket(ticket);
      if (qrCodeDataURL) {
        // Convertir base64 a buffer
        const base64Data = qrCodeDataURL.replace(/^data:image\/png;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        
        attachments.push({
          filename: `qr-ticket-${(ticket as any)._id}.png`,
          content: buffer,
          cid: `qr-${(ticket as any)._id}`, // Content ID para referenciar en el HTML
          contentType: 'image/png'
        });
      }
    });

    return this.sendEmail({
      to: userEmail,
      subject,
      html,
    }, attachments);
  }

  private getQRCodeFromTicket(ticket: Ticket): string {
    // Usar el QR ya generado y guardado en el ticket
    const qrCode = (ticket as any).qrCode || '';
    this.logger.log(`🔍 QR para ticket ${(ticket as any)._id}: ${qrCode ? 'Disponible' : 'No disponible'}`);
    if (qrCode) {
      this.logger.log(`📏 Longitud del QR: ${qrCode.length} caracteres`);
    }
    return qrCode;
  }

  private generateTicketConfirmationHTML(
    userName: string,
    event: Event,
    tickets: Ticket[],
    totalAmount: number,
  ): string {
    // Usar códigos QR ya generados y guardados en cada ticket
    const ticketList = tickets.map(ticket => {
      const qrCodeDataURL = this.getQRCodeFromTicket(ticket);
      return `
        <tr>
          <td>${ticket.ticketType}</td>
          <td>$${ticket.price}</td>
          <td>${(ticket as any)._id}</td>
          <td style="text-align: center;">
            ${qrCodeDataURL ? `
              <div style="text-align: center;">
                <img src="cid:qr-${(ticket as any)._id}" 
                     alt="Código QR para entrada ${(ticket as any)._id}" 
                     style="width: 120px; height: 120px; display: block; margin: 0 auto;" />
                <p style="font-size: 10px; color: #666; margin: 5px 0 0 0;">Código QR</p>
              </div>
            ` : '<span style="color: red;">QR no disponible</span>'}
          </td>
        </tr>
      `;
    }).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Confirmación de Reserva</title>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0; 
            background-color: #f8f9fa;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background-color: white;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header { 
            background: linear-gradient(135deg, #2d5016 0%, #4a7c59 100%);
            padding: 30px 20px; 
            text-align: center; 
            color: white;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
          }
          .header .subtitle {
            margin: 8px 0 0 0;
            font-size: 14px;
            opacity: 0.9;
          }
          .content { padding: 30px 20px; }
          .section {
            margin-bottom: 30px;
            padding-left: 0px;
          }
          .section-title {
            color: #2d5016;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
          }
          .section-icon {
            margin-right: 8px;
            font-size: 20px;
          }
          .ticket-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 20px 0;
            background-color: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .ticket-table th { 
            background-color: #4a7c59; 
            color: white;
            padding: 15px 12px; 
            text-align: left;
            font-weight: 600;
          }
          .ticket-table td { 
            padding: 15px 12px; 
            border-bottom: 1px solid #e9ecef;
          }
          .ticket-table tr:last-child td {
            border-bottom: none;
          }
          .total { 
            font-weight: bold; 
            font-size: 1.3em; 
            color: #2d5016;
            text-align: center;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 8px;
            margin: 20px 0;
          }
          .info-box {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .info-box h3 {
            color: #2d5016;
            margin: 0 0 15px 0;
            font-size: 16px;
          }
          .info-box ul {
            margin: 0;
            padding-left: 20px;
          }
          .info-box li {
            margin-bottom: 8px;
            color: #555;
          }
          .footer { 
            background-color: #2d5016; 
            padding: 20px; 
            text-align: center; 
            color: white;
            font-size: 0.9em;
          }
          .event-details {
            background-color: white;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .event-detail-row {
            display: flex;
            margin-bottom: 12px;
            align-items: center;
          }
          .event-detail-label {
            font-weight: 600;
            color: #2d5016;
            min-width: 80px;
            margin-right: 15px;
          }
          .qr-instructions {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎫 Confirmación de Reserva</h1>
            <p class="subtitle">Tu entrada ha sido confirmada exitosamente</p>
          </div>
          
          <div class="content">
            <p>Hola <strong>${userName}</strong>,</p>
            
            <p>¡Gracias por tu compra! Tu reserva ha sido confirmada exitosamente.</p>
            
            <div class="section">
              <h2 class="section-title">
                <span class="section-icon">📅</span>
                Detalles del Evento
              </h2>
              <div class="event-details">
                <div class="event-detail-row">
                  <span class="event-detail-label">Evento:</span>
                  <span>${event.name}</span>
                </div>
                <div class="event-detail-row">
                  <span class="event-detail-label">Fecha:</span>
                  <span>${new Date(event.date).toLocaleDateString('es-ES')}</span>
                </div>
                <div class="event-detail-row">
                  <span class="event-detail-label">Hora:</span>
                  <span>${event.time}</span>
                </div>
                <div class="event-detail-row">
                  <span class="event-detail-label">Descripción:</span>
                  <span>${event.description}</span>
                </div>
              </div>
            </div>
            
            <div class="section">
              <h2 class="section-title">
                <span class="section-icon">🎫</span>
                Detalles de tus Entradas
              </h2>
              <table class="ticket-table">
                <thead>
                  <tr>
                    <th>Tipo de Entrada</th>
                    <th>Precio</th>
                    <th>ID de Entrada</th>
                    <th>Código QR</th>
                  </tr>
                </thead>
                <tbody>
                  ${ticketList}
                </tbody>
              </table>
              
              <div class="total">
                <p><strong>Total Pagado: $${totalAmount}</strong></p>
              </div>
            </div>
            
            <div class="section">
              <h2 class="section-title">
                <span class="section-icon">📱</span>
                Códigos QR de tus Entradas
              </h2>
              <div class="qr-instructions">
                <h3>Instrucciones para usar tus códigos QR:</h3>
                <ul>
                  <li>Guarda este email en tu teléfono</li>
                  <li>Muestra el código QR al ingresar al evento</li>
                  <li>Cada código QR es único para tu entrada</li>
                  <li>El código QR contiene toda la información de validación</li>
                </ul>
              </div>
            </div>
            
            <div class="section">
              <h2 class="section-title">
                <span class="section-icon">ℹ️</span>
                Información Importante
              </h2>
              <div class="info-box">
                <ul>
                  <li><strong>Validación:</strong> El código QR contiene la información necesaria para validar tu entrada</li>
                  <li><strong>Dispositivo móvil:</strong> Puedes mostrar el código QR desde este email en tu teléfono</li>
                  <li>Las entradas son válidas solo para la fecha y hora especificadas</li>
                  <li>No se permiten devoluciones o cambios una vez confirmada la compra</li>
                  <li>En caso de cancelación del evento, serás contactado para el reembolso</li>
                </ul>
              </div>
            </div>
            
            <p>¡Esperamos verte en el evento!</p>
            
            <p>Saludos cordiales,<br>
            El equipo de Tickets</p>
          </div>
          
          <div class="footer">
            <p>Este es un email automático, por favor no responder a este mensaje.</p>
            <p>Si tienes alguna consulta, contacta a nuestro servicio de atención al cliente.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendEventModificationEmail(data: {
    userEmail: string;
    userName: string;
    event: any;
    modificationType: string;
    oldValue: any;
    newValue: any;
    ticketCount: number;
    ticketTypes: string[];
  }): Promise<boolean> {
    const { userEmail, userName, event, modificationType, oldValue, newValue, ticketCount, ticketTypes } = data;
    
    const subject = this.getModificationSubject(modificationType, event.name);
    const html = this.generateEventModificationHTML(userName, event, modificationType, oldValue, newValue, ticketCount, ticketTypes);
    
    return this.sendEmail({
      to: userEmail,
      subject,
      html,
    });
  }

  async sendEventCancellationEmail(data: {
    userEmail: string;
    userName: string;
    event: any;
    ticketCount: number;
    ticketTypes: string[];
    cancellationReason?: string;
  }): Promise<boolean> {
    const { userEmail, userName, event, ticketCount, ticketTypes, cancellationReason } = data;
    
    const subject = `❌ Evento Cancelado - ${event.name}`;
    const html = this.generateEventCancellationHTML(userName, event, ticketCount, ticketTypes, cancellationReason);
    
    return this.sendEmail({
      to: userEmail,
      subject,
      html,
    });
  }

  private getModificationSubject(modificationType: string, eventName: string): string {
    const subjects = {
      'date_change': `⚠️ Cambio de Fecha - ${eventName}`,
      'time_change': `⚠️ Cambio de Hora - ${eventName}`,
      'location_change': `📍 Nueva Ubicación - ${eventName}`,
      'ticket_change': `🎫 Cambio en Entradas - ${eventName}`,
      'cancellation': `❌ Evento Cancelado - ${eventName}`
    };
    return subjects[modificationType] || `⚠️ Cambio Importante - ${eventName}`;
  }

  private generateEventModificationHTML(
    userName: string,
    event: any,
    modificationType: string,
    oldValue: any,
    newValue: any,
    ticketCount: number,
    ticketTypes: string[]
  ): string {
    const modificationContent = this.getModificationContent(modificationType, oldValue, newValue);
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Cambio Importante en tu Evento</title>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0; 
            background-color: #f8f9fa;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background-color: white;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header { 
            background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
            padding: 30px 20px; 
            text-align: center; 
            color: white;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
          }
          .content { padding: 30px 20px; }
          .alert-box {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            border-left: 4px solid #f39c12;
          }
          .change-details {
            background-color: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .event-details {
            background-color: white;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .ticket-info {
            background-color: #e7f3ff;
            border: 1px solid #b3d9ff;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .footer { 
            background-color: #495057; 
            padding: 20px; 
            text-align: center; 
            color: white;
            font-size: 0.9em;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Cambio Importante</h1>
            <p>Tu evento ha sido modificado</p>
          </div>
          
          <div class="content">
            <p>Hola <strong>${userName}</strong>,</p>
            
            <div class="alert-box">
              <h3>🚨 Atención Requerida</h3>
              <p>El evento para el cual tienes entradas ha sido modificado. Por favor revisa los cambios a continuación.</p>
            </div>
            
            <div class="change-details">
              <h3>📝 Detalles del Cambio</h3>
              ${modificationContent}
            </div>
            
            <div class="event-details">
              <h3>📅 Información Actualizada del Evento</h3>
              <p><strong>Evento:</strong> ${event.name}</p>
              <p><strong>Fecha:</strong> ${new Date(event.date).toLocaleDateString('es-ES')}</p>
              <p><strong>Hora:</strong> ${event.time}</p>
              <p><strong>Descripción:</strong> ${event.description}</p>
            </div>
            
            <div class="ticket-info">
              <h3>🎫 Tus Entradas</h3>
              <p><strong>Cantidad de entradas:</strong> ${ticketCount}</p>
              <p><strong>Tipos de entrada:</strong> ${ticketTypes.join(', ')}</p>
              <p><strong>Estado:</strong> Todas tus entradas siguen siendo válidas</p>
            </div>
            
            <p>Lamentamos cualquier inconveniente que esto pueda causar.</p>
            
            <p>Saludos cordiales,<br>
            El equipo de Tickets</p>
          </div>
          
          <div class="footer">
            <p>Este es un email automático, por favor no responder a este mensaje.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateEventCancellationHTML(
    userName: string,
    event: any,
    ticketCount: number,
    ticketTypes: string[],
    cancellationReason?: string
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Evento Cancelado</title>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0; 
            background-color: #f8f9fa;
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background-color: white;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header { 
            background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
            padding: 30px 20px; 
            text-align: center; 
            color: white;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
          }
          .content { padding: 30px 20px; }
          .cancellation-box {
            background-color: #f8d7da;
            border: 1px solid #f5c6cb;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            border-left: 4px solid #dc3545;
          }
          .refund-info {
            background-color: #d1ecf1;
            border: 1px solid #bee5eb;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .event-details {
            background-color: white;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .ticket-info {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .footer { 
            background-color: #495057; 
            padding: 20px; 
            text-align: center; 
            color: white;
            font-size: 0.9em;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>❌ Evento Cancelado</h1>
            <p>Información importante sobre tu compra</p>
          </div>
          
          <div class="content">
            <p>Hola <strong>${userName}</strong>,</p>
            
            <div class="cancellation-box">
              <h3>🚨 Evento Cancelado</h3>
              <p>Lamentamos informarte que el evento <strong>"${event.name}"</strong> ha sido cancelado.</p>
              ${cancellationReason ? `<p><strong>Motivo de la cancelación:</strong> ${cancellationReason}</p>` : ''}
            </div>
            
            <div class="refund-info">
              <h3>💰 Proceso de Reembolso</h3>
              <ul>
                <li><strong>Reembolso automático:</strong> Tu dinero será devuelto automáticamente</li>
                <li><strong>Tiempo de procesamiento:</strong> 3-5 días hábiles</li>
                <li><strong>Método de reembolso:</strong> Al método de pago original</li>
                <li><strong>Sin acción requerida:</strong> No necesitas hacer nada</li>
              </ul>
            </div>
            
            <div class="event-details">
              <h3>📅 Evento Cancelado</h3>
              <p><strong>Evento:</strong> ${event.name}</p>
              <p><strong>Fecha:</strong> ${new Date(event.date).toLocaleDateString('es-ES')}</p>
              <p><strong>Hora:</strong> ${event.time}</p>
            </div>
            
            <div class="ticket-info">
              <h3>🎫 Entradas Afectadas</h3>
              <p><strong>Cantidad de entradas:</strong> ${ticketCount}</p>
              <p><strong>Tipos de entrada:</strong> ${ticketTypes.join(', ')}</p>
              <p><strong>Estado:</strong> Todas las entradas han sido canceladas automáticamente</p>
            </div>
            
            <p>Sentimos mucho las molestias causadas por esta cancelación. Esperamos poder ofrecerte eventos de calidad en el futuro.</p>
            
            <p>Si tienes alguna pregunta sobre el reembolso, no dudes en contactarnos.</p>
            
            <p>Saludos cordiales,<br>
            El equipo de Tickets</p>
          </div>
          
          <div class="footer">
            <p>Este es un email automático, por favor no responder a este mensaje.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getModificationContent(modificationType: string, oldValue: any, newValue: any): string {
    switch (modificationType) {
      case 'date_change':
        return `
          <p><strong>Fecha:</strong> 
            <span style="color: #dc3545; text-decoration: line-through;">${new Date(oldValue).toLocaleDateString('es-ES')}</span>
            → 
            <span style="color: #28a745; font-weight: 600;">${new Date(newValue).toLocaleDateString('es-ES')}</span>
          </p>
        `;
      
      case 'time_change':
        return `
          <p><strong>Hora:</strong> 
            <span style="color: #dc3545; text-decoration: line-through;">${oldValue}</span>
            → 
            <span style="color: #28a745; font-weight: 600;">${newValue}</span>
          </p>
        `;
      
      case 'location_change':
        return `
          <p><strong>Ubicación:</strong> 
            <span style="color: #dc3545; text-decoration: line-through;">${oldValue}</span>
            → 
            <span style="color: #28a745; font-weight: 600;">${newValue}</span>
          </p>
        `;
      
      default:
        return `<p><strong>Cambio:</strong> El evento ha sido modificado</p>`;
    }
  }
}
