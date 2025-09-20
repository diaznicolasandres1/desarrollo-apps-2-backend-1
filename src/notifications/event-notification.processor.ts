import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { EventNotificationService, EventChangeData } from './event-notification.service';

@Processor('event-notifications')
export class EventNotificationProcessor {
  private readonly logger = new Logger(EventNotificationProcessor.name);

  constructor(private readonly eventNotificationService: EventNotificationService) {}

  @Process('send-notifications')
  async handleEventChange(job: { data: EventChangeData }) {
    this.logger.log(`Procesando job de notificación para evento ${job.data.event._id} - Tipo: ${job.data.changeType}`);
    
    try {
      await this.eventNotificationService.processEventChange(job.data);
      this.logger.log(`Job completado exitosamente para evento ${job.data.event._id}`);
    } catch (error) {
      this.logger.error(`Error procesando job para evento ${job.data.event._id}:`, error);
      throw error; // Re-throw para que Bull maneje el retry
    }
  }
}
