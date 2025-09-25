import { Test, TestingModule } from '@nestjs/testing';
import { EventChangeDetector, ChangeType } from '../event-change-detector.service';

describe('EventChangeDetector', () => {
  let service: EventChangeDetector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventChangeDetector],
    }).compile();

    service = module.get<EventChangeDetector>(EventChangeDetector);
  });

  describe('detectCriticalChange', () => {
    it('should detect date_time_change when both date and time change', () => {
      const originalEvent = {
        date: '2024-01-01',
        time: '10:00'
      };
      const updateData = {
        date: '2024-01-02',
        time: '11:00'
      };

      const result = service.detectCriticalChange(originalEvent, updateData);

      expect(result).toBe('date_time_change');
    });

    it('should detect date_change when only date changes', () => {
      const originalEvent = {
        date: '2024-01-01',
        time: '10:00'
      };
      const updateData = {
        date: '2024-01-02',
        time: '10:00'
      };

      const result = service.detectCriticalChange(originalEvent, updateData);

      expect(result).toBe('date_change');
    });

    it('should detect time_change when only time changes', () => {
      const originalEvent = {
        date: '2024-01-01',
        time: '10:00'
      };
      const updateData = {
        date: '2024-01-01',
        time: '11:00'
      };

      const result = service.detectCriticalChange(originalEvent, updateData);

      expect(result).toBe('time_change');
    });

    it('should return null when no critical changes detected', () => {
      const originalEvent = {
        date: '2024-01-01',
        time: '10:00'
      };
      const updateData = {
        name: 'New Event Name' // Only non-critical field changes
      };

      const result = service.detectCriticalChange(originalEvent, updateData);

      expect(result).toBeNull();
    });

    it('should return null when updateData is empty', () => {
      const originalEvent = {
        date: '2024-01-01',
        time: '10:00'
      };
      const updateData = {};

      const result = service.detectCriticalChange(originalEvent, updateData);

      expect(result).toBeNull();
    });

    it('should handle date with different formats', () => {
      const originalEvent = {
        date: '2024-01-01T00:00:00.000Z',
        time: '10:00'
      };
      const updateData = {
        date: '2024-01-02T00:00:00.000Z',
        time: '10:00'
      };

      const result = service.detectCriticalChange(originalEvent, updateData);

      expect(result).toBe('date_change');
    });

    it('should handle invalid date strings', () => {
      const originalEvent = {
        date: 'invalid-date',
        time: '10:00'
      };
      const updateData = {
        date: '2024-01-02',
        time: '10:00'
      };

      const result = service.detectCriticalChange(originalEvent, updateData);

      // Should still detect as date change since we're comparing strings
      expect(result).toBe('date_change');
    });

    it('should handle missing time in original event', () => {
      const originalEvent = {
        date: '2024-01-01'
        // time is missing
      };
      const updateData = {
        date: '2024-01-01',
        time: '11:00'
      };

      const result = service.detectCriticalChange(originalEvent, updateData);

      expect(result).toBe('time_change');
    });

    it('should handle missing time in update data', () => {
      const originalEvent = {
        date: '2024-01-01',
        time: '10:00'
      };
      const updateData = {
        date: '2024-01-02'
        // time is missing
      };

      const result = service.detectCriticalChange(originalEvent, updateData);

      expect(result).toBe('date_change');
    });
  });

  describe('detectStatusChange', () => {
    it('should detect activation when event becomes active', () => {
      const originalEvent = {
        isActive: false
      };
      const updatedEvent = {
        isActive: true
      };

      const result = service.detectStatusChange(originalEvent, updatedEvent);

      expect(result).toBe('activation');
    });

    it('should detect cancellation when event becomes inactive', () => {
      const originalEvent = {
        isActive: true
      };
      const updatedEvent = {
        isActive: false
      };

      const result = service.detectStatusChange(originalEvent, updatedEvent);

      expect(result).toBe('cancellation');
    });

    it('should return null when status does not change', () => {
      const originalEvent = {
        isActive: true
      };
      const updatedEvent = {
        isActive: true
      };

      const result = service.detectStatusChange(originalEvent, updatedEvent);

      expect(result).toBeNull();
    });

    it('should return null when both events are inactive', () => {
      const originalEvent = {
        isActive: false
      };
      const updatedEvent = {
        isActive: false
      };

      const result = service.detectStatusChange(originalEvent, updatedEvent);

      expect(result).toBeNull();
    });

    it('should handle missing isActive field in original event', () => {
      const originalEvent = {};
      const updatedEvent = {
        isActive: true
      };

      const result = service.detectStatusChange(originalEvent, updatedEvent);

      expect(result).toBe('activation');
    });

    it('should handle missing isActive field in updated event', () => {
      const originalEvent = {
        isActive: true
      };
      const updatedEvent = {};

      const result = service.detectStatusChange(originalEvent, updatedEvent);

      expect(result).toBe('cancellation');
    });

    it('should handle both events missing isActive field', () => {
      const originalEvent = {};
      const updatedEvent = {};

      const result = service.detectStatusChange(originalEvent, updatedEvent);

      expect(result).toBeNull();
    });
  });
});
