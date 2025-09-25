import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class SchedulesValidator {
  /**
   * Valida que los horarios tengan el formato correcto y sean válidos
   */
  static validate(schedules: any): void {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    for (const day of days) {
      const schedule = schedules[day];
      
      if (!schedule) {
        throw new BadRequestException(`Schedule for ${day} is required`);
      }

      if (!schedule.closed) {
        if (!schedule.open || !schedule.close) {
          throw new BadRequestException(`Opening and closing hours are required for ${day}`);
        }

        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(schedule.open) || !timeRegex.test(schedule.close)) {
          throw new BadRequestException(`Invalid time format for ${day}. Use HH:MM`);
        }
      }
    }
  }
}
