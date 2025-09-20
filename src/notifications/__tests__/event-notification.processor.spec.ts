import { Test, TestingModule } from '@nestjs/testing';
import { EventNotificationProcessor } from '../event-notification.processor';
import { EventNotificationService } from '../event-notification.service';

describe('EventNotificationProcessor', () => {
  let processor: EventNotificationProcessor;
  let eventNotificationService: jest.Mocked<EventNotificationService>;

  const mockJob = {
    data: {
      event: {
        _id: '507f1f77bcf86cd799439011',
        name: 'Test Event',
        description: 'Test Description',
        date: '2025-12-31T20:00:00.000Z',
        time: '20:00',
        isActive: true,
      },
      changeType: 'date_change',
      oldValue: '2025-12-30',
      newValue: '2025-12-31',
    },
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventNotificationProcessor,
        {
          provide: EventNotificationService,
          useValue: {
            processEventChange: jest.fn(),
          },
        },
      ],
    }).compile();

    processor = module.get<EventNotificationProcessor>(EventNotificationProcessor);
    eventNotificationService = module.get(EventNotificationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleEventChange', () => {
    it('should process event change successfully', async () => {
      eventNotificationService.processEventChange.mockResolvedValue(undefined);

      await processor.handleEventChange(mockJob);

      expect(eventNotificationService.processEventChange).toHaveBeenCalledWith(mockJob.data);
    });

    it('should handle processing errors and rethrow them', async () => {
      const error = new Error('Processing failed');
      eventNotificationService.processEventChange.mockRejectedValue(error);

      await expect(processor.handleEventChange(mockJob)).rejects.toThrow(error);
      expect(eventNotificationService.processEventChange).toHaveBeenCalledWith(mockJob.data);
    });

    it('should process cancellation event', async () => {
      const cancellationJob = {
        data: {
          event: {
            _id: '507f1f77bcf86cd799439011',
            name: 'Test Event',
            description: 'Test Description',
            date: '2025-12-31T20:00:00.000Z',
            time: '20:00',
            isActive: false,
          },
          changeType: 'cancellation',
          oldValue: 'Activo',
          newValue: 'Inactivo',
        },
      } as any;

      eventNotificationService.processEventChange.mockResolvedValue(undefined);

      await processor.handleEventChange(cancellationJob);

      expect(eventNotificationService.processEventChange).toHaveBeenCalledWith(cancellationJob.data);
    });

    it('should process activation event', async () => {
      const activationJob = {
        data: {
          event: {
            _id: '507f1f77bcf86cd799439011',
            name: 'Test Event',
            description: 'Test Description',
            date: '2025-12-31T20:00:00.000Z',
            time: '20:00',
            isActive: true,
          },
          changeType: 'activation',
          oldValue: 'Inactivo',
          newValue: 'Activo',
        },
      } as any;

      eventNotificationService.processEventChange.mockResolvedValue(undefined);

      await processor.handleEventChange(activationJob);

      expect(eventNotificationService.processEventChange).toHaveBeenCalledWith(activationJob.data);
    });

    it('should process location change event', async () => {
      const locationChangeJob = {
        data: {
          event: {
            _id: '507f1f77bcf86cd799439011',
            name: 'Test Event',
            description: 'Test Description',
            date: '2025-12-31T20:00:00.000Z',
            time: '20:00',
            isActive: true,
          },
          changeType: 'location_change',
          oldValue: 'Teatro Recoleta',
          newValue: 'Carpe Diem',
        },
      } as any;

      eventNotificationService.processEventChange.mockResolvedValue(undefined);

      await processor.handleEventChange(locationChangeJob);

      expect(eventNotificationService.processEventChange).toHaveBeenCalledWith(locationChangeJob.data);
    });

    it('should process time change event', async () => {
      const timeChangeJob = {
        data: {
          event: {
            _id: '507f1f77bcf86cd799439011',
            name: 'Test Event',
            description: 'Test Description',
            date: '2025-12-31T20:00:00.000Z',
            time: '21:00',
            isActive: true,
          },
          changeType: 'time_change',
          oldValue: '20:00',
          newValue: '21:00',
        },
      } as any;

      eventNotificationService.processEventChange.mockResolvedValue(undefined);

      await processor.handleEventChange(timeChangeJob);

      expect(eventNotificationService.processEventChange).toHaveBeenCalledWith(timeChangeJob.data);
    });

    it('should process date_time_change event', async () => {
      const dateTimeChangeJob = {
        data: {
          event: {
            _id: '507f1f77bcf86cd799439011',
            name: 'Test Event',
            description: 'Test Description',
            date: '2025-12-31T20:00:00.000Z',
            time: '21:00',
            isActive: true,
          },
          changeType: 'date_time_change',
          oldValue: '30/12/2025 a las 20:00',
          newValue: '31/12/2025 a las 21:00',
        },
      } as any;

      eventNotificationService.processEventChange.mockResolvedValue(undefined);

      await processor.handleEventChange(dateTimeChangeJob);

      expect(eventNotificationService.processEventChange).toHaveBeenCalledWith(dateTimeChangeJob.data);
    });
  });
});
