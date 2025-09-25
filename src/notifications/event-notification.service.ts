import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { EmailService } from '../email/email.service';
import { TicketsService } from '../tickets/tickets.service';

export interface EventChangeData {
  event: any; // Event completo
  changeType: 'date_change' | 'time_change' | 'date_time_change' | 'cancellation' | 'activation';
  oldValue?: any; // Valor original del campo modificado
  newValue?: any; // Nuevo valor del campo modificado
}

@Injectable()
export class EventNotificationService {
  private readonly logger = new Logger(EventNotificationService.name);

  constructor(
    @InjectQueue('event-notifications') private eventNotificationQueue: Queue,
    private readonly emailService: EmailService,
    private readonly ticketsService: TicketsService,
  ) {}

  async publishEventChange(data: EventChangeData): Promise<void> {
    try {
      await this.eventNotificationQueue.add('send-notifications', data, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
      });
      this.logger.log(`Evento de cambio publicado para el evento ${data.event._id} - Tipo: ${data.changeType}`);
    } catch (error) {
      this.logger.error(`Error publicando evento de cambio para el evento ${data.event._id}:`, error);
      throw error;
    }
  }

  async processEventChange(data: EventChangeData): Promise<void> {
    const { event, changeType, oldValue, newValue } = data;
    this.logger.log(`Procesando notificación para evento ${event._id} - Tipo: ${changeType}`);

    const usersWithTickets = await this.ticketsService.getUsersWithActiveTicketsForEvent(event._id.toString());

    if (usersWithTickets.length === 0) {
      this.logger.log(`No hay usuarios con tickets activos para el evento ${event._id}. No se enviarán notificaciones.`);
      return;
    }

    this.logger.log(`Enviando notificaciones a ${usersWithTickets.length} usuarios para el evento ${event._id}`);

    for (const user of usersWithTickets) {
      try {
        if (changeType === 'cancellation') {
          await this.emailService.sendEventCancellationEmail({
            userEmail: user.userEmail,
            userName: user.userName,
            event: event,
            ticketCount: user.ticketCount,
            ticketTypes: user.ticketTypes,
            cancellationReason: 'El evento ha sido cancelado por el organizador.',
          });
          this.logger.log(`Email de cancelación enviado a ${user.userEmail} para el evento ${event._id}`);
        } else {
          // Para otros tipos de cambio, se envía una notificación de modificación
          await this.emailService.sendEventModificationEmail({
            userEmail: user.userEmail,
            userName: user.userName,
            event: event,
            modificationType: changeType,
            oldValue: oldValue || 'N/A',
            newValue: newValue || 'N/A',
            ticketCount: user.ticketCount,
            ticketTypes: user.ticketTypes,
          });
          this.logger.log(`Email de modificación enviado a ${user.userEmail} para el evento ${event._id} - Tipo: ${changeType}`);
        }
      } catch (emailError) {
        this.logger.error(`Error enviando email a ${user.userEmail} para el evento ${event._id}:`, emailError);
      }
    }

    this.logger.log(`Proceso de notificación completado para el evento ${event._id}`);
  }
}
