import { Test, TestingModule } from '@nestjs/testing';
import { ChangeValueFormatter } from '../change-value-formatter.service';
import { ChangeType } from '../event-change-detector.service';

describe('ChangeValueFormatter', () => {
  let service: ChangeValueFormatter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChangeValueFormatter],
    }).compile();

    service = module.get<ChangeValueFormatter>(ChangeValueFormatter);
  });

  describe('getChangeValues', () => {
    it('should format date change values', async () => {
      const originalEvent = {
        date: '2024-01-01',
        time: '10:00'
      };
      const updatedEvent = {
        date: '2024-01-02',
        time: '10:00'
      };

      const result = await service.getChangeValues(originalEvent, updatedEvent, 'date_change');

      expect(result).toEqual({
        oldValue: '1/1/2024',
        newValue: '2/1/2024'
      });
    });

    it('should format date_time change values', async () => {
      const originalEvent = {
        date: '2024-01-01',
        time: '10:00'
      };
      const updatedEvent = {
        date: '2024-01-02',
        time: '11:00'
      };

      const result = await service.getChangeValues(originalEvent, updatedEvent, 'date_time_change');

      expect(result).toEqual({
        oldValue: '1/1/2024 a las 10:00',
        newValue: '2/1/2024 a las 11:00'
      });
    });

    it('should format time change values', async () => {
      const originalEvent = {
        date: '2024-01-01',
        time: '10:00'
      };
      const updatedEvent = {
        date: '2024-01-01',
        time: '11:00'
      };

      const result = await service.getChangeValues(originalEvent, updatedEvent, 'time_change');

      expect(result).toEqual({
        oldValue: '10:00',
        newValue: '11:00'
      });
    });

    it('should format activation change values', async () => {
      const originalEvent = {
        isActive: false
      };
      const updatedEvent = {
        isActive: true
      };

      const result = await service.getChangeValues(originalEvent, updatedEvent, 'activation');

      expect(result).toEqual({
        oldValue: 'Inactivo',
        newValue: 'Activo'
      });
    });

    it('should format cancellation change values', async () => {
      const originalEvent = {
        isActive: true
      };
      const updatedEvent = {
        isActive: false
      };

      const result = await service.getChangeValues(originalEvent, updatedEvent, 'cancellation');

      expect(result).toEqual({
        oldValue: 'Activo',
        newValue: 'Inactivo'
      });
    });

    it('should handle missing time values', async () => {
      const originalEvent = {
        date: '2024-01-01'
        // time is missing
      };
      const updatedEvent = {
        date: '2024-01-01'
        // time is missing
      };

      const result = await service.getChangeValues(originalEvent, updatedEvent, 'time_change');

      expect(result).toEqual({
        oldValue: 'N/A',
        newValue: 'N/A'
      });
    });

    it('should handle null change type', async () => {
      const originalEvent = { date: '2024-01-01' };
      const updatedEvent = { date: '2024-01-01' };

      const result = await service.getChangeValues(originalEvent, updatedEvent, null);

      expect(result).toEqual({
        oldValue: 'N/A',
        newValue: 'N/A'
      });
    });
  });

  describe('formatDateChange', () => {
    it('should format date change correctly', async () => {
      const originalEvent = { date: '2024-01-01' };
      const updatedEvent = { date: '2024-01-02' };

      const result = await (service as any).formatDateChange(originalEvent, updatedEvent);

      expect(result).toEqual({
        oldValue: '1/1/2024',
        newValue: '2/1/2024'
      });
    });

    it('should handle invalid dates', async () => {
      const originalEvent = { date: 'invalid-date' };
      const updatedEvent = { date: '2024-01-02' };

      const result = await (service as any).formatDateChange(originalEvent, updatedEvent);

      expect(result.oldValue).toBe('Fecha inválida (invalid-date)');
      expect(result.newValue).toBe('2/1/2024');
    });
  });

  describe('formatDateTimeChange', () => {
    it('should format date time change correctly', async () => {
      const originalEvent = { date: '2024-01-01', time: '10:00' };
      const updatedEvent = { date: '2024-01-02', time: '11:00' };

      const result = await (service as any).formatDateTimeChange(originalEvent, updatedEvent);

      expect(result).toEqual({
        oldValue: '1/1/2024 a las 10:00',
        newValue: '2/1/2024 a las 11:00'
      });
    });

    it('should handle missing time', async () => {
      const originalEvent = { date: '2024-01-01' };
      const updatedEvent = { date: '2024-01-02' };

      const result = await (service as any).formatDateTimeChange(originalEvent, updatedEvent);

      expect(result).toEqual({
        oldValue: '1/1/2024 a las undefined',
        newValue: '2/1/2024 a las undefined'
      });
    });

    it('should handle invalid dates', async () => {
      const originalEvent = { date: 'invalid-date', time: '10:00' };
      const updatedEvent = { date: '2024-01-02', time: '11:00' };

      const result = await (service as any).formatDateTimeChange(originalEvent, updatedEvent);

      expect(result.oldValue).toBe('Fecha inválida (invalid-date)');
      expect(result.newValue).toBe('2/1/2024 a las 11:00');
    });
  });
});