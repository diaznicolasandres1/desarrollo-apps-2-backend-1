import { Injectable, Logger } from '@nestjs/common';
import { EventNotificationService } from '../../notifications/event-notification.service';
import { EventChangeDetector, ChangeType } from './event-change-detector.service';
import { ChangeValueFormatter } from './change-value-formatter.service';
import type { EventRepository } from '../interfaces/event.repository.interface';

@Injectable()
export class EventChangeNotifier {
  private readonly logger = new Logger(EventChangeNotifier.name);

  constructor(
    private readonly eventNotificationService: EventNotificationService,
    private readonly eventChangeDetector: EventChangeDetector,
    private readonly changeValueFormatter: ChangeValueFormatter,
    private readonly repository: EventRepository
  ) {}

  /**
   * Notifica cambios en un evento
   */
  async notifyEventChange(eventId: string, originalEvent: any, updateData: any, updatedEvent: any): Promise<void> {
    const changeType = this.eventChangeDetector.detectCriticalChange(originalEvent, updateData);
    
    if (changeType) {
      try {
        // Para location_change, necesitamos obtener los nombres de los lugares culturales
        let oldValue, newValue;
        if (changeType === 'location_change') {
          // Obtener el evento actualizado con populate para tener los nombres
          const updatedEventWithPopulate = await this.repository.findById(eventId);
          oldValue = originalEvent.culturalPlaceId?.name || 'N/A';
          newValue = updatedEventWithPopulate?.culturalPlaceId?.name || 'N/A';
        } else {
          const changeValues = await this.changeValueFormatter.getChangeValues(originalEvent, updatedEvent, changeType);
          oldValue = changeValues.oldValue;
          newValue = changeValues.newValue;
        }
        
        await this.eventNotificationService.publishEventChange({
          event: updatedEvent,
          changeType: changeType,
          oldValue,
          newValue,
        });
      } catch (error) {
        this.logger.error(`Error publishing event modification for event ${eventId}:`, error);
      }
    }
  }

  /**
   * Notifica cambios de estado en un evento
   */
  async notifyStatusChange(eventId: string, originalEvent: any, updatedEvent: any): Promise<void> {
    const changeType = this.eventChangeDetector.detectStatusChange(originalEvent, updatedEvent);

    // Publicar al tópico si hay cambio de estado
    if (changeType) {
      try {
        const { oldValue, newValue } = await this.changeValueFormatter.getChangeValues(originalEvent, updatedEvent, changeType);
        await this.eventNotificationService.publishEventChange({
          event: updatedEvent,
          changeType: changeType,
          oldValue,
          newValue,
        });
      } catch (error) {
        this.logger.error(`Error publishing event status change for event ${eventId}:`, error);
      }
    }
  }
}
