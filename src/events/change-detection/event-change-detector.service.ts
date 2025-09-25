import { Injectable } from '@nestjs/common';

export type ChangeType = 'location_change' | 'date_change' | 'time_change' | 'date_time_change' | 'activation' | 'cancellation' | null;

@Injectable()
export class EventChangeDetector {
  /**
   * Detecta si hay cambios críticos entre el evento original y los datos de actualización
   */
  detectCriticalChange(originalEvent: any, updateData: any): ChangeType {
    // Cambio de lugar cultural
    if (updateData.culturalPlaceId && updateData.culturalPlaceId.toString() !== originalEvent.culturalPlaceId.toString()) {
      return 'location_change';
    }

    // Verificar cambios en fecha y hora
    const dateChanged = updateData.date && new Date(updateData.date).getTime() !== new Date(originalEvent.date).getTime();
    const timeChanged = updateData.time && updateData.time !== originalEvent.time;

    // Si cambian ambos, es un cambio de fecha y hora
    if (dateChanged && timeChanged) {
      return 'date_time_change';
    }

    // Si solo cambia la fecha
    if (dateChanged) {
      return 'date_change';
    }

    // Si solo cambia la hora
    if (timeChanged) {
      return 'time_change';
    }

    return null;
  }

  /**
   * Detecta si hay cambios de estado (activación/desactivación)
   */
  detectStatusChange(originalEvent: any, updatedEvent: any): ChangeType {
    const changeType = originalEvent.isActive !== updatedEvent.isActive
      ? (updatedEvent.isActive ? 'activation' : 'cancellation')
      : null;

    return changeType;
  }
}
