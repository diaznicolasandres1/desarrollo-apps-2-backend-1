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
    description: 'Un museo dedicado al arte moderno y contemporáneo',
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
      coordinates: { 
        type: 'Point',
        coordinates: [-58.3816, -34.6037] // [lng, lat]
      },
      phone: '+54 11 1234-5678',
      website: 'https://museoarte.com',
      email: 'info@museoarte.com',
    },
    image: 'https://example.com/museo.jpg',
    rating: 4.5,
    isActive: true,
    color: '#FF6B6B',
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
        description: 'Un museo dedicado al arte moderno',
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
      
      // Verificar que se llame con el DTO original más el color generado automáticamente
      const createCall = mockRepository.create.mock.calls[0][0];
      expect(createCall).toMatchObject(createDto);
      expect(createCall.color).toBeDefined();
      expect(typeof createCall.color).toBe('string');
      expect(createCall.color).toMatch(/^#[0-9A-F]{6}$/i); // Verificar formato hexadecimal
    });

    it('should throw ConflictException if name already exists', async () => {
      const createDto: CreateCulturalPlaceDto = {
        name: 'Museo Existente',
        description: 'Un museo existente',
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
        description: 'Un museo de arte',
        category: 'Museo',
        schedules: mockCulturalPlace.schedules,
        contact: {
          ...mockCulturalPlace.contact,
          coordinates: { 
            type: 'Point',
            coordinates: [0, 100] // Invalid latitude [lng, lat]
          },
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

  describe('update', () => {
    it('should update a cultural place', async () => {
      const updateDto = {
        name: 'Museo de Arte Actualizado',
        rating: 4.8,
      };
      const updatedPlace = { ...mockCulturalPlace, ...updateDto };

      mockRepository.findById.mockResolvedValue(mockCulturalPlace);
      mockRepository.update.mockResolvedValue(updatedPlace);

      const result = await service.update('507f1f77bcf86cd799439011', updateDto);

      expect(result).toEqual(updatedPlace);
      expect(repository.update).toHaveBeenCalledWith('507f1f77bcf86cd799439011', updateDto);
    });

    it('should throw NotFoundException if place not found', async () => {
      const updateDto = { name: 'Nuevo Nombre' };

      mockRepository.findById.mockResolvedValue(null);

      await expect(service.update('invalid-id', updateDto)).rejects.toThrow(NotFoundException);
    });

    it('should validate coordinates if provided', async () => {
      const updateDto = {
        contact: {
          coordinates: { 
            type: 'Point',
            coordinates: [0, 100] // Invalid latitude [lng, lat]
          },
        },
      };

      mockRepository.findById.mockResolvedValue(mockCulturalPlace);

      await expect(service.update('507f1f77bcf86cd799439011', updateDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should remove a cultural place', async () => {
      mockRepository.findById.mockResolvedValue(mockCulturalPlace);
      mockRepository.delete.mockResolvedValue(true);

      await service.remove('507f1f77bcf86cd799439011');

      expect(repository.delete).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should throw NotFoundException if place not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.remove('invalid-id')).rejects.toThrow(NotFoundException);
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

    it('should accept custom categories', async () => {
      const customCategoryDto: CreateCulturalPlaceDto = {
        name: 'Centro de Innovación',
        description: 'Un centro de innovación tecnológica',
        category: 'Centro de Innovación', // Categoría personalizada
        schedules: mockCulturalPlace.schedules,
        contact: mockCulturalPlace.contact,
        image: 'https://example.com/image.jpg',
      };

      const createdPlace = { ...mockCulturalPlace, category: 'Centro de Innovación' };
      mockRepository.findByName.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(createdPlace);

      const result = await service.create(customCategoryDto);

      expect(result.category).toBe('Centro de Innovación');
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'Centro de Innovación'
        })
      );
    });
  });
});
