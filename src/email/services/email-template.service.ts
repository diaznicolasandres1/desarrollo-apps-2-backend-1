import { Injectable } from '@nestjs/common';
import { Ticket } from '../../tickets/schemas/ticket.schema';
import { Event } from '../../events/schemas/event.schema';
import { 
  TicketPurchaseEmailData, 
  EventModificationEmailData, 
  EventCancellationEmailData,
  EmailTemplateData 
} from '../interfaces/email.interface';
import { EmailAttachmentService } from './email-attachment.service';

@Injectable()
export class EmailTemplateService {
  constructor(private readonly emailAttachmentService: EmailAttachmentService) {}

  /**
   * Genera el HTML para el email de confirmación de tickets
   */
  generateTicketConfirmationHTML(data: TicketPurchaseEmailData): string {
    const { userName, event, tickets, totalAmount } = data;
    
    const ticketList = this.generateTicketListHTML(tickets);
    
    return this.generateBaseHTML(`
      <div class="header">
        <h1>🎫 Confirmación de Reserva</h1>
        <p class="subtitle">Tu entrada ha sido confirmada exitosamente</p>
      </div>
      
      <div class="content">
        <p>Hola <strong>${userName}</strong>,</p>
        
        <p>¡Gracias por tu compra! Tu reserva ha sido confirmada exitosamente.</p>
        
        ${this.generateEventDetailsSection(event)}
        
        ${this.generateTicketDetailsSection(ticketList, totalAmount)}
        
        ${this.generateQRSection()}
        
        ${this.generateInfoSection()}
        
        <p>¡Esperamos verte en el evento!</p>
        
        <p>Saludos cordiales,<br>
        El equipo de Tickets</p>
      </div>
    `);
  }

  /**
   * Genera el HTML para el email de modificación de evento
   */
  generateEventModificationHTML(data: EventModificationEmailData): string {
    const { userName, event, modificationType, oldValue, newValue, ticketCount, ticketTypes } = data;
    
    const modificationDetails = this.getModificationDetails(modificationType, oldValue, newValue);
    const subject = this.getModificationSubject(modificationType, event.name);
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2c3e50; margin: 0; font-size: 28px;">🎭 Cultural Places</h1>
            <p style="color: #7f8c8d; margin: 5px 0 0 0; font-size: 16px;">Actualización de Evento</p>
          </div>
          
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <h2 style="color: #856404; margin: 0 0 15px 0; font-size: 20px;">⚠️ Cambio Importante en tu Evento</h2>
            <p style="color: #856404; margin: 0; line-height: 1.5;">
              Hola <strong>${userName}</strong>,<br><br>
              Te informamos sobre una modificación importante en el evento <strong>"${event.name}"</strong> para el cual tienes ${ticketCount} entrada(s) de tipo(s) <strong>${ticketTypes.join(', ')}</strong>.
            </p>
          </div>
          
          <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <h3 style="color: #495057; margin: 0 0 15px 0; font-size: 18px;">📋 Detalles del Cambio</h3>
            <p style="color: #495057; margin: 0; line-height: 1.6;">
              ${modificationDetails}
            </p>
          </div>
          
          <div style="background-color: #e3f2fd; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <h3 style="color: #1976d2; margin: 0 0 15px 0; font-size: 18px;">🎫 Información de tus Entradas</h3>
            <div style="color: #1976d2;">
              <p style="margin: 0 0 10px 0;"><strong>Evento:</strong> ${event.name}</p>
              <p style="margin: 0 0 10px 0;"><strong>Fecha:</strong> ${new Date(new Date(event.date).getTime() + 4 * 60 * 60 * 1000).toLocaleDateString()}</p>
              <p style="margin: 0 0 10px 0;"><strong>Hora:</strong> ${event.time}</p>
              <p style="margin: 0 0 10px 0;"><strong>Entradas:</strong> ${ticketCount} de tipo(s) ${ticketTypes.join(', ')}</p>
            </div>
          </div>
          
          <div style="background-color: #fff3e0; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <h3 style="color: #f57c00; margin: 0 0 15px 0; font-size: 18px;">💡 Próximos Pasos</h3>
            <ul style="color: #f57c00; margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 8px;">Revisa los nuevos detalles del evento en nuestra plataforma</li>
              <li style="margin-bottom: 8px;">Si tienes alguna pregunta, no dudes en contactarnos</li>
              <li style="margin-bottom: 8px;">Tus entradas siguen siendo válidas para el evento</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef;">
            <p style="color: #6c757d; margin: 0; font-size: 14px;">
              Gracias por tu comprensión y por elegir Cultural Places.
            </p>
            <p style="color: #6c757d; margin: 10px 0 0 0; font-size: 14px;">
              <strong>El equipo de Cultural Places</strong>
            </p>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Genera el HTML para el email de cancelación de evento
   */
  generateEventCancellationHTML(data: EventCancellationEmailData): string {
    const { userName, event, ticketCount, ticketTypes, cancellationReason } = data;
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2c3e50; margin: 0; font-size: 28px;">🎭 Cultural Places</h1>
            <p style="color: #7f8c8d; margin: 5px 0 0 0; font-size: 16px;">Cancelación de Evento</p>
          </div>
          
          <div style="background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <h2 style="color: #721c24; margin: 0 0 15px 0; font-size: 20px;">❌ Evento Cancelado</h2>
            <p style="color: #721c24; margin: 0; line-height: 1.5;">
              Hola <strong>${userName}</strong>,<br><br>
              Lamentamos informarte que el evento <strong>"${event.name}"</strong> ha sido cancelado.
            </p>
          </div>
          
          <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <h3 style="color: #495057; margin: 0 0 15px 0; font-size: 18px;">📋 Detalles del Evento Cancelado</h3>
            <div style="color: #495057;">
              <p style="margin: 0 0 10px 0;"><strong>Evento:</strong> ${event.name}</p>
              <p style="margin: 0 0 10px 0;"><strong>Fecha programada:</strong> ${new Date(new Date(event.date).getTime() + 4 * 60 * 60 * 1000).toLocaleDateString()}</p>
              <p style="margin: 0 0 10px 0;"><strong>Hora:</strong> ${event.time}</p>
              <p style="margin: 0 0 10px 0;"><strong>Entradas afectadas:</strong> ${ticketCount} de tipo(s) ${ticketTypes.join(', ')}</p>
              ${cancellationReason ? `<p style="margin: 0;"><strong>Razón:</strong> ${cancellationReason}</p>` : ''}
            </div>
          </div>
          
          <div style="background-color: #e3f2fd; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <h3 style="color: #1976d2; margin: 0 0 15px 0; font-size: 18px;">💰 Opciones de Reembolso</h3>
            <p style="color: #1976d2; margin: 0; line-height: 1.6;">
              Nos pondremos en contacto contigo en breve para informarte sobre las opciones de reembolso o reubicación disponibles.
            </p>
          </div>
          
          <div style="background-color: #fff3e0; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <h3 style="color: #f57c00; margin: 0 0 15px 0; font-size: 18px;">📞 Contacto</h3>
            <p style="color: #f57c00; margin: 0; line-height: 1.6;">
              Si tienes alguna pregunta o necesitas asistencia adicional, no dudes en contactarnos.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef;">
            <p style="color: #6c757d; margin: 0; font-size: 14px;">
              Lamentamos cualquier inconveniente que esto pueda causar.
            </p>
            <p style="color: #6c757d; margin: 10px 0 0 0; font-size: 14px;">
              <strong>El equipo de Cultural Places</strong>
            </p>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Genera el subject para emails de modificación
   */
  getModificationSubject(modificationType: string, eventName: string): string {
    const subjects = {
      'date_change': `⚠️ Cambio de Fecha - ${eventName}`,
      'time_change': `⚠️ Cambio de Hora - ${eventName}`,
      'date_time_change': `⚠️ Cambio de Fecha y Hora - ${eventName}`,
      'location_change': `📍 Nueva Ubicación - ${eventName}`,
      'activation': `✅ Evento Reactivado - ${eventName}`,
    };
    
    return subjects[modificationType] || `📢 Actualización - ${eventName}`;
  }

  // Métodos privados para generar secciones específicas del HTML

  private generateBaseHTML(content: string): string {
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
          ${content}
          
          <div class="footer">
            <p>Este es un email automático, por favor no responder a este mensaje.</p>
            <p>Si tienes alguna consulta, contacta a nuestro servicio de atención al cliente.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateTicketListHTML(tickets: Ticket[]): string {
    return tickets.map(ticket => {
      const hasQR = this.emailAttachmentService.hasQRCode(ticket);
      const qrCID = this.emailAttachmentService.getQRCID(ticket);
      
      return `
        <tr>
          <td>${ticket.ticketType}</td>
          <td>$${ticket.price}</td>
          <td>${(ticket as any)._id}</td>
          <td style="text-align: center;">
            ${hasQR ? `
              <div style="text-align: center;">
                <img src="cid:${qrCID}" 
                     alt="Código QR para entrada ${(ticket as any)._id}" 
                     style="width: 120px; height: 120px; display: block; margin: 0 auto;" />
                <p style="font-size: 10px; color: #666; margin: 5px 0 0 0;">Código QR</p>
              </div>
            ` : '<span style="color: red;">QR no disponible</span>'}
          </td>
        </tr>
      `;
    }).join('');
  }

  private generateEventDetailsSection(event: Event): string {
    return `
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
            <span>${new Date(new Date(event.date).getTime() + 4 * 60 * 60 * 1000).toLocaleDateString('es-ES')}</span>
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
    `;
  }

  private generateTicketDetailsSection(ticketList: string, totalAmount: number): string {
    return `
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
    `;
  }

  private generateQRSection(): string {
    return `
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
    `;
  }

  private generateInfoSection(): string {
    return `
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
    `;
  }

  private getModificationDetails(modificationType: string, oldValue: any, newValue: any): string {
    switch (modificationType) {
      case 'date_change':
        return `La fecha original era <strong>${oldValue}</strong> y la nueva fecha es <strong>${newValue}</strong>.`;
      case 'time_change':
        return `La hora original era <strong>${oldValue}</strong> y la nueva hora es <strong>${newValue}</strong>.`;
      case 'date_time_change':
        return `La fecha y hora originales eran <strong>${oldValue}</strong> y las nuevas son <strong>${newValue}</strong>.`;
      case 'location_change':
        return `La ubicación original era <strong>${oldValue.name || oldValue}</strong> y la nueva ubicación es <strong>${newValue.name || newValue}</strong>.`;
      case 'activation':
        return `El evento ha sido reactivado y se llevará a cabo como estaba previsto.`;
      default:
        return `Ha habido una actualización importante en el evento.`;
    }
  }
}
