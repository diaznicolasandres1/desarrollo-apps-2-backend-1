import { Test, TestingModule } from '@nestjs/testing';
import { CulturalPlacesService } from '../cultural-places.service';
import { ICulturalPlaceRepository, CULTURAL_PLACE_REPOSITORY } from '../interfaces/cultural-place.repository.interface';
import { CreateCulturalPlaceDto } from '../dto/create-cultural-place.dto';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';

describe('CulturalPlacesService', () => {
  let service: CulturalPlacesService;
  let repository: ICulturalPlaceRepository;

  const mockCulturalPlace = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Museo de Arte Moderno',
    category: 'Museo',
    characteristics: ['Exposiciones temporales'],
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
      address: 'Av. Principal 123',
      coordinates: { lat: -34.6037, lng: -58.3816 },
      phone: '+54 11 1234-5678',
      website: 'https://museoarte.com',
      email: 'info@museoarte.com',
    },
    image: 'https://example.com/museo.jpg',
    rating: 4.5,
    isActive: true,
  };

  const mockRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByName: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findByCategory: jest.fn(),
    findTopRated: jest.fn(),
    findOpenPlaces: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CulturalPlacesService,
        {
          provide: CULTURAL_PLACE_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CulturalPlacesService>(CulturalPlacesService);
    repository = module.get<ICulturalPlaceRepository>(CULTURAL_PLACE_REPOSITORY);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new cultural place', async () => {
      const createDto: CreateCulturalPlaceDto = {
        name: 'Museo de Arte',
        category: 'Museo',
        schedules: mockCulturalPlace.schedules,
        contact: mockCulturalPlace.contact,
        image: 'https://example.com/image.jpg',
      };

      mockRepository.findByName.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(mockCulturalPlace);

      const result = await service.create(createDto);

      expect(result).toEqual(mockCulturalPlace);
      expect(repository.findByName).toHaveBeenCalledWith(createDto.name);
      expect(repository.create).toHaveBeenCalledWith(createDto);
    });

    it('should throw ConflictException if name already exists', async () => {
      const createDto: CreateCulturalPlaceDto = {
        name: 'Museo Existente',
        category: 'Museo',
        schedules: mockCulturalPlace.schedules,
        contact: mockCulturalPlace.contact,
        image: 'https://example.com/image.jpg',
      };

      mockRepository.findByName.mockResolvedValue(mockCulturalPlace);

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException for invalid coordinates', async () => {
      const createDto: CreateCulturalPlaceDto = {
        name: 'Museo de Arte',
        category: 'Museo',
        schedules: mockCulturalPlace.schedules,
        contact: {
          ...mockCulturalPlace.contact,
          coordinates: { lat: 100, lng: 0 }, // Invalid latitude
        },
        image: 'https://example.com/image.jpg',
      };

      mockRepository.findByName.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all cultural places', async () => {
      mockRepository.findAll.mockResolvedValue([mockCulturalPlace]);

      const result = await service.findAll();

      expect(result).toEqual([mockCulturalPlace]);
      expect(repository.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a cultural place by id', async () => {
      mockRepository.findById.mockResolvedValue(mockCulturalPlace);

      const result = await service.findOne('507f1f77bcf86cd799439011');

      expect(result).toEqual(mockCulturalPlace);
      expect(repository.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByCategory', () => {
    it('should return places by category', async () => {
      mockRepository.findByCategory.mockResolvedValue([mockCulturalPlace]);

      const result = await service.findByCategory('Museo');

      expect(result).toEqual([mockCulturalPlace]);
      expect(repository.findByCategory).toHaveBeenCalledWith('Museo');
    });
  });

  describe('findTopRated', () => {
    it('should return top rated places', async () => {
      mockRepository.findTopRated.mockResolvedValue([mockCulturalPlace]);

      const result = await service.findTopRated(5);

      expect(result).toEqual([mockCulturalPlace]);
      expect(repository.findTopRated).toHaveBeenCalledWith(5);
    });
  });

  describe('toggleActive', () => {
    it('should toggle active status', async () => {
      const inactivePlace = { ...mockCulturalPlace, isActive: false };
      
      mockRepository.findById.mockResolvedValue(mockCulturalPlace);
      mockRepository.update.mockResolvedValue(inactivePlace);

      const result = await service.toggleActive('507f1f77bcf86cd799439011');

      expect(result.isActive).toBe(false);
      expect(repository.update).toHaveBeenCalledWith('507f1f77bcf86cd799439011', { isActive: false });
    });
  });
});
