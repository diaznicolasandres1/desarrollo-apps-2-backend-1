import { Test, TestingModule } from '@nestjs/testing';
import { CulturalPlacesController } from '../cultural-places.controller';
import { CulturalPlacesService } from '../cultural-places.service';
import { CreateCulturalPlaceDto } from '../dto/create-cultural-place.dto';
import { UpdateCulturalPlaceDto } from '../dto/update-cultural-place.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('CulturalPlacesController', () => {
  let controller: CulturalPlacesController;
  let service: CulturalPlacesService;

  const mockCulturalPlace = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Modern Art Museum',
    description: 'A museum dedicated to modern and contemporary art',
    category: 'Museum',
    characteristics: ['Temporary exhibitions'],
    schedules: {
      monday: { open: '10:00', close: '18:00', closed: false },
      tuesday: { open: '10:00', close: '18:00', closed: false },
      wednesday: { open: '10:00', close: '18:00', closed: false },
      thursday: { open: '10:00', close: '18:00', closed: false },
      friday: { open: '10:00', close: '18:00', closed: false },
      saturday: { open: '10:00', close: '18:00', closed: false },
      sunday: { open: '10:00', close: '18:00', closed: false },
    },
    contact: {
      address: 'Main St 123',
      coordinates: { lat: -34.6037, lng: -58.3816 },
      phone: '+54 11 1234-5678',
      website: 'https://museumart.com',
      email: 'info@museumart.com',
    },
    image: 'https://example.com/museum.jpg',
    rating: 4.5,
    isActive: true,
  };

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    toggleActive: jest.fn(),
    remove: jest.fn(),
    findByCategory: jest.fn(),
    findOpenPlaces: jest.fn(),
    findTopRated: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CulturalPlacesController],
      providers: [
        {
          provide: CulturalPlacesService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<CulturalPlacesController>(CulturalPlacesController);
    service = module.get<CulturalPlacesService>(CulturalPlacesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a cultural place', async () => {
      const createDto: CreateCulturalPlaceDto = {
        name: 'Art Museum',
        description: 'An art museum showcasing contemporary works',
        category: 'Museum',
        schedules: mockCulturalPlace.schedules,
        contact: mockCulturalPlace.contact,
        image: 'https://example.com/image.jpg',
      };

      mockService.create.mockResolvedValue(mockCulturalPlace);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockCulturalPlace);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return all cultural places', async () => {
      mockService.findAll.mockResolvedValue([mockCulturalPlace]);

      const result = await controller.findAll();

      expect(result).toEqual([mockCulturalPlace]);
      expect(service.findAll).toHaveBeenCalled();
    });

    it('should return filtered cultural places', async () => {
      const query = { category: 'Museum' };
      mockService.findAll.mockResolvedValue([mockCulturalPlace]);

      const result = await controller.findAll(query);

      expect(result).toEqual([mockCulturalPlace]);
      expect(service.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('should return a cultural place by id', async () => {
      mockService.findOne.mockResolvedValue(mockCulturalPlace);

      const result = await controller.findOne('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockCulturalPlace);
      expect(service.findOne).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });
  });

  describe('update', () => {
    it('should update a cultural place', async () => {
      const updateDto: UpdateCulturalPlaceDto = { name: 'New Name' };
      const updatedPlace = { ...mockCulturalPlace, name: 'New Name' };

      mockService.update.mockResolvedValue(updatedPlace);

      const result = await controller.update('507f1f77bcf86cd799439011', updateDto);

      expect(result).toEqual(updatedPlace);
      expect(service.update).toHaveBeenCalledWith('507f1f77bcf86cd799439011', updateDto);
    });
  });

  describe('toggleActive', () => {
    it('should toggle active status', async () => {
      const inactivePlace = { ...mockCulturalPlace, isActive: false };
      mockService.toggleActive.mockResolvedValue(inactivePlace);

      const result = await controller.toggleActive('507f1f77bcf86cd799439011');

      expect(result).toEqual(inactivePlace);
      expect(service.toggleActive).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });
  });

  describe('remove', () => {
    it('should remove a cultural place', async () => {
      mockService.remove.mockResolvedValue(undefined);

      await controller.remove('507f1f77bcf86cd799439011');

      expect(service.remove).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });
  });

  describe('findByCategory', () => {
    it('should return places by category', async () => {
      mockService.findByCategory.mockResolvedValue([mockCulturalPlace]);

      const result = await controller.findByCategory('Museum');

      expect(result).toEqual([mockCulturalPlace]);
      expect(service.findByCategory).toHaveBeenCalledWith('Museum');
    });
  });

  describe('findOpenPlaces', () => {
    it('should return open places for a day', async () => {
      mockService.findOpenPlaces.mockResolvedValue([mockCulturalPlace]);

      const result = await controller.findOpenPlaces('monday');

      expect(result).toEqual([mockCulturalPlace]);
      expect(service.findOpenPlaces).toHaveBeenCalledWith('monday');
    });
  });

  describe('findTopRated', () => {
    it('should return top rated places', async () => {
      mockService.findTopRated.mockResolvedValue([mockCulturalPlace]);

      const result = await controller.findTopRated('5');

      expect(result).toEqual([mockCulturalPlace]);
      expect(service.findTopRated).toHaveBeenCalledWith(5);
    });

    it('should use default limit when no limit provided', async () => {
      mockService.findTopRated.mockResolvedValue([mockCulturalPlace]);

      const result = await controller.findTopRated();

      expect(result).toEqual([mockCulturalPlace]);
      expect(service.findTopRated).toHaveBeenCalledWith(10);
    });
  });

  describe('findNearby', () => {
    it('should return nearby places', async () => {
      mockService.findAll.mockResolvedValue([mockCulturalPlace]);

      const result = await controller.findNearby('40.7128', '-74.0060', '5');

      expect(result).toEqual([mockCulturalPlace]);
      expect(service.findAll).toHaveBeenCalledWith({
        lat: 40.7128,
        lng: -74.0060,
        radius: 5,
      });
    });
  });
});
