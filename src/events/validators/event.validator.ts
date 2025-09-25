import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateEventDto } from '../dto/create-event.dto';

@Injectable()
export class EventValidator {
  /**
   * Valida los datos de un evento completo
   */
  validateEventData(createEventDto: CreateEventDto): void {
    this.validateEventDate(new Date(createEventDto.date));
    this.validateEventTime(createEventDto.time);
  }

  /**
   * Valida que la fecha del evento no sea en el pasado
   */
  validateEventDate(date: Date): void {
    const now = new Date();
    if (date < now) {
      throw new BadRequestException('Event date cannot be in the past');
    }
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
