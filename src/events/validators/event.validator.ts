import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateEventDto } from '../dto/create-event.dto';

@Injectable()
export class EventValidator {
  /**
   * Valida los datos de un evento completo
   */
  validateEventData(createEventDto: CreateEventDto): void {
    this.validateEventTime(createEventDto.time);
  }

  /**
   * Valida el formato de la hora del evento
   */
  validateEventTime(time: string): void {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      throw new BadRequestException('Invalid time format. Use HH:MM format');
    }
  }
}
