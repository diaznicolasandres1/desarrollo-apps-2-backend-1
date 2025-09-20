import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { EmailService } from '../email/email.service';
import { TicketsService } from '../tickets/tickets.service';

export interface EventChangeData {
  event: any; // Event completo
  changeType: 'location_change' | 'date_change' | 'time_change' | 'cancellation' | 'activation';
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
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      });
      
      this.logger.log(`Evento de cambio publicado para evento ${data.event._id} - Tipo: ${data.changeType}`);
    } catch (error) {
      this.logger.error('Error publicando evento de cambio:', error);
      throw error;
    }
  }

  async processEventChange(data: EventChangeData): Promise<void> {
    try {
      this.logger.log(`Procesando notificaciones para evento ${data.event._id} - Tipo: ${data.changeType}`);

      // Obtener usuarios con tickets activos
      const usersWithTickets = await this.ticketsService.getUsersWithActiveTicketsForEvent(data.event._id);
      
      if (!usersWithTickets || usersWithTickets.length === 0) {
        this.logger.log(`No hay usuarios con tickets activos para el evento ${data.event._id}`);
        return;
      }

      this.logger.log(`Enviando notificaciones a ${usersWithTickets.length} usuarios para el evento ${data.event._id}`);

      // Enviar notificaciones a cada usuario
      for (const user of usersWithTickets) {
        try {
          const emailSent = await this.sendNotificationByType(user, data);
          
          if (emailSent) {
            this.logger.log(`Notificación enviada a ${user.userEmail}`);
          } else {
            this.logger.warn(`Error enviando notificación a ${user.userEmail}`);
          }
        } catch (error) {
          this.logger.error(`Error enviando notificación a ${user.userEmail}:`, error);
        }
      }

      this.logger.log(`Proceso de notificación completado para el evento ${data.event._id}`);
    } catch (error) {
      this.logger.error('Error procesando notificaciones de evento:', error);
      throw error;
    }
  }

  private async sendNotificationByType(user: any, data: EventChangeData): Promise<boolean> {
    const { event, changeType } = data;
    
    switch (changeType) {
      case 'cancellation':
        return await this.emailService.sendEventCancellationEmail({
          userEmail: user.userEmail,
          userName: user.userName,
          event: event,
          ticketCount: user.ticketCount,
          ticketTypes: user.ticketTypes,
          cancellationReason: 'El evento ha sido cancelado por el organizador',
        });

      case 'location_change':
        return await this.emailService.sendEventModificationEmail({
          userEmail: user.userEmail,
          userName: user.userName,
          event: event,
          modificationType: 'location_change',
          oldValue: 'Ubicación anterior',
          newValue: 'Nueva ubicación',
          ticketCount: user.ticketCount,
          ticketTypes: user.ticketTypes,
        });

      case 'date_change':
        return await this.emailService.sendEventModificationEmail({
          userEmail: user.userEmail,
          userName: user.userName,
          event: event,
          modificationType: 'date_change',
          oldValue: 'Fecha anterior',
          newValue: event.date,
          ticketCount: user.ticketCount,
          ticketTypes: user.ticketTypes,
        });

      case 'time_change':
        return await this.emailService.sendEventModificationEmail({
          userEmail: user.userEmail,
          userName: user.userName,
          event: event,
          modificationType: 'time_change',
          oldValue: 'Hora anterior',
          newValue: event.time,
          ticketCount: user.ticketCount,
          ticketTypes: user.ticketTypes,
        });

      case 'activation':
        return await this.emailService.sendEventModificationEmail({
          userEmail: user.userEmail,
          userName: user.userName,
          event: event,
          modificationType: 'cancellation', // Reutilizamos el template pero con mensaje diferente
          oldValue: 'Evento cancelado',
          newValue: 'Evento reactivado',
          ticketCount: user.ticketCount,
          ticketTypes: user.ticketTypes,
        });

      default:
        this.logger.warn(`Tipo de cambio no reconocido: ${changeType}`);
        return false;
    }
  }
}
