import { BadRequestException } from '@nestjs/common';
import { SchedulesValidator } from '../schedules.validator';

describe('SchedulesValidator', () => {
  const validSchedule = {
    open: '09:00',
    close: '18:00',
    closed: false
  };

  const validClosedSchedule = {
    open: '',
    close: '',
    closed: true
  };

  const validSchedules = {
    monday: validSchedule,
    tuesday: validSchedule,
    wednesday: validSchedule,
    thursday: validSchedule,
    friday: validSchedule,
    saturday: validClosedSchedule,
    sunday: validClosedSchedule
  };

  describe('validate', () => {
    it('should validate correct schedules', () => {
      expect(() => SchedulesValidator.validate(validSchedules)).not.toThrow();
    });

    it('should validate all days with open schedules', () => {
      const allOpenSchedules = {
        monday: validSchedule,
        tuesday: validSchedule,
        wednesday: validSchedule,
        thursday: validSchedule,
        friday: validSchedule,
        saturday: validSchedule,
        sunday: validSchedule
      };

      expect(() => SchedulesValidator.validate(allOpenSchedules)).not.toThrow();
    });

    it('should validate all days with closed schedules', () => {
      const allClosedSchedules = {
        monday: validClosedSchedule,
        tuesday: validClosedSchedule,
        wednesday: validClosedSchedule,
        thursday: validClosedSchedule,
        friday: validClosedSchedule,
        saturday: validClosedSchedule,
        sunday: validClosedSchedule
      };

      expect(() => SchedulesValidator.validate(allClosedSchedules)).not.toThrow();
    });

    it('should validate mixed open/closed schedules', () => {
      const mixedSchedules = {
        monday: validSchedule,
        tuesday: validClosedSchedule,
        wednesday: validSchedule,
        thursday: validClosedSchedule,
        friday: validSchedule,
        saturday: validClosedSchedule,
        sunday: validClosedSchedule
      };

      expect(() => SchedulesValidator.validate(mixedSchedules)).not.toThrow();
    });

    it('should throw BadRequestException for missing monday schedule', () => {
      const invalidSchedules = { ...validSchedules };
      delete invalidSchedules.monday;

      expect(() => SchedulesValidator.validate(invalidSchedules))
        .toThrow(BadRequestException);
      
      expect(() => SchedulesValidator.validate(invalidSchedules))
        .toThrow('Schedule for monday is required');
    });

    it('should throw BadRequestException for missing tuesday schedule', () => {
      const invalidSchedules = { ...validSchedules };
      delete invalidSchedules.tuesday;

      expect(() => SchedulesValidator.validate(invalidSchedules))
        .toThrow(BadRequestException);
      
      expect(() => SchedulesValidator.validate(invalidSchedules))
        .toThrow('Schedule for tuesday is required');
    });

    it('should throw BadRequestException for missing sunday schedule', () => {
      const invalidSchedules = { ...validSchedules };
      delete invalidSchedules.sunday;

      expect(() => SchedulesValidator.validate(invalidSchedules))
        .toThrow(BadRequestException);
      
      expect(() => SchedulesValidator.validate(invalidSchedules))
        .toThrow('Schedule for sunday is required');
    });

    it('should throw BadRequestException for open schedule without open time', () => {
      const invalidSchedule = {
        open: '',
        close: '18:00',
        closed: false
      };

      const invalidSchedules = { ...validSchedules, monday: invalidSchedule };

      expect(() => SchedulesValidator.validate(invalidSchedules))
        .toThrow(BadRequestException);
      
      expect(() => SchedulesValidator.validate(invalidSchedules))
        .toThrow('Opening and closing hours are required for monday');
    });

    it('should throw BadRequestException for open schedule without close time', () => {
      const invalidSchedule = {
        open: '09:00',
        close: '',
        closed: false
      };

      const invalidSchedules = { ...validSchedules, monday: invalidSchedule };

      expect(() => SchedulesValidator.validate(invalidSchedules))
        .toThrow(BadRequestException);
      
      expect(() => SchedulesValidator.validate(invalidSchedules))
        .toThrow('Opening and closing hours are required for monday');
    });

    it('should throw BadRequestException for invalid open time format', () => {
      const invalidSchedule = {
        open: '25:00',
        close: '18:00',
        closed: false
      };

      const invalidSchedules = { ...validSchedules, monday: invalidSchedule };

      expect(() => SchedulesValidator.validate(invalidSchedules))
        .toThrow(BadRequestException);
      
      expect(() => SchedulesValidator.validate(invalidSchedules))
        .toThrow('Invalid time format for monday. Use HH:MM');
    });

    it('should throw BadRequestException for invalid close time format', () => {
      const invalidSchedule = {
        open: '09:00',
        close: '25:00',
        closed: false
      };

      const invalidSchedules = { ...validSchedules, monday: invalidSchedule };

      expect(() => SchedulesValidator.validate(invalidSchedules))
        .toThrow(BadRequestException);
      
      expect(() => SchedulesValidator.validate(invalidSchedules))
        .toThrow('Invalid time format for monday. Use HH:MM');
    });

    it('should throw BadRequestException for invalid time format with minutes > 59', () => {
      const invalidSchedule = {
        open: '09:60',
        close: '18:00',
        closed: false
      };

      const invalidSchedules = { ...validSchedules, monday: invalidSchedule };

      expect(() => SchedulesValidator.validate(invalidSchedules))
        .toThrow(BadRequestException);
      
      expect(() => SchedulesValidator.validate(invalidSchedules))
        .toThrow('Invalid time format for monday. Use HH:MM');
    });

    it('should validate correct time formats', () => {
      const validTimeFormats = [
        '00:00', '09:30', '12:00', '23:59', '1:00', '01:00'
      ];

      validTimeFormats.forEach(time => {
        const schedule = {
          open: time,
          close: '18:00',
          closed: false
        };
        const schedules = { ...validSchedules, monday: schedule };
        
        expect(() => SchedulesValidator.validate(schedules)).not.toThrow();
      });
    });

    it('should validate 24-hour format times', () => {
      const schedule = {
        open: '00:00',
        close: '23:59',
        closed: false
      };

      const schedules = { ...validSchedules, monday: schedule };
      expect(() => SchedulesValidator.validate(schedules)).not.toThrow();
    });

    it('should allow empty open/close times for closed days', () => {
      const closedSchedule = {
        open: '',
        close: '',
        closed: true
      };

      const schedules = { ...validSchedules, monday: closedSchedule };
      expect(() => SchedulesValidator.validate(schedules)).not.toThrow();
    });

    it('should validate edge case times', () => {
      const edgeCaseSchedule = {
        open: '00:00',
        close: '23:59',
        closed: false
      };

      const schedules = { ...validSchedules, monday: edgeCaseSchedule };
      expect(() => SchedulesValidator.validate(schedules)).not.toThrow();
    });
  });
});
