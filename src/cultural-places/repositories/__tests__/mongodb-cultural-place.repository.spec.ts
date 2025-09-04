import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MongoDBCulturalPlaceRepository } from '../mongodb-cultural-place.repository';
import { CulturalPlace, CulturalPlaceDocument } from '../../schemas/cultural-place.schema';

describe('MongoDBCulturalPlaceRepository', () => {
  let repository: MongoDBCulturalPlaceRepository;
  let model: Model<CulturalPlaceDocument>;

  const mockCulturalPlace = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Test Cultural Place',
    category: 'Museo',
    characteristics: ['Arte', 'Historia'],
    schedules: {
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '09:00', close: '18:00', closed: false },
      saturday: { open: '10:00', close: '16:00', closed: false },
      sunday: { open: '10:00', close: '16:00', closed: false },
    },
    contact: {
      address: 'Test Address 123',
      coordinates: { lat: -34.61724004, lng: -58.40879856 },
      phone: '123456789',
      website: 'https://test.com',
      email: 'test@test.com',
    },
    image: 'https://test.com/image.jpg',
    rating: 4.5,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    // Crear un mock que funcione como constructor
    const MockModel = jest.fn().mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(mockCulturalPlace),
    }));

    // Agregar métodos estáticos al mock
    (MockModel as any).find = jest.fn().mockReturnValue({
      limit: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue([mockCulturalPlace]),
          }),
        }),
      }),
      sort: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockCulturalPlace]),
      }),
    });
    (MockModel as any).findById = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockCulturalPlace),
    });
    (MockModel as any).findOne = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockCulturalPlace),
    });
    (MockModel as any).findByIdAndUpdate = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockCulturalPlace),
    });
    (MockModel as any).findByIdAndDelete = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockCulturalPlace),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MongoDBCulturalPlaceRepository,
        {
          provide: getModelToken(CulturalPlace.name),
          useValue: MockModel,
        },
      ],
    }).compile();

    repository = module.get<MongoDBCulturalPlaceRepository>(MongoDBCulturalPlaceRepository);
    model = module.get<Model<CulturalPlaceDocument>>(getModelToken(CulturalPlace.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create a new cultural place', async () => {
      const createDto = {
        name: 'Test Place',
        category: 'Museo',
        characteristics: ['Arte'],
        schedules: mockCulturalPlace.schedules,
        contact: mockCulturalPlace.contact,
        image: 'https://test.com/image.jpg',
        rating: 4.5,
        isActive: true,
      };

      const result = await repository.create(createDto);

      expect(model).toHaveBeenCalledWith({
        ...createDto,
        rating: 4.5,
        isActive: true,
      });
      expect(result).toEqual(mockCulturalPlace);
    });
  });

  describe('findById', () => {
    it('should find a cultural place by id', async () => {
      const result = await repository.findById('507f1f77bcf86cd799439011');

      expect(model.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(result).toEqual(mockCulturalPlace);
    });
  });

  describe('findByName', () => {
    it('should find a cultural place by name', async () => {
      const result = await repository.findByName('Test Cultural Place');

      expect(model.findOne).toHaveBeenCalledWith({ name: 'Test Cultural Place' });
      expect(result).toEqual(mockCulturalPlace);
    });
  });

  describe('update', () => {
    it('should update a cultural place', async () => {
      const updateDto = {
        name: 'Updated Name',
        rating: 5.0,
      };

      const result = await repository.update('507f1f77bcf86cd799439011', updateDto);

      expect(model.findByIdAndUpdate).toHaveBeenCalledWith('507f1f77bcf86cd799439011', updateDto, { new: true });
      expect(result).toEqual(mockCulturalPlace);
    });
  });

  describe('delete', () => {
    it('should delete a cultural place and return true', async () => {
      const result = await repository.delete('507f1f77bcf86cd799439011');

      expect(model.findByIdAndDelete).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(result).toBe(true);
    });
  });

  describe('findByCategory', () => {
    it('should find cultural places by category', async () => {
      const result = await repository.findByCategory('Museo');

      expect(model.find).toHaveBeenCalledWith({ category: 'Museo', isActive: true });
      expect(result).toEqual([mockCulturalPlace]);
    });
  });

  describe('findTopRated', () => {
    it('should find top rated cultural places', async () => {
      // Mock the chained methods properly
      const mockExec = jest.fn().mockResolvedValue([mockCulturalPlace]);
      const mockLimit = jest.fn().mockReturnValue({ exec: mockExec });
      const mockSort = jest.fn().mockReturnValue({ limit: mockLimit });
      jest.spyOn(model, 'find').mockReturnValue({ sort: mockSort } as any);

      const result = await repository.findTopRated(5);

      expect(model.find).toHaveBeenCalledWith({ isActive: true });
      expect(result).toEqual([mockCulturalPlace]);
    });
  });

  describe('findOpenPlaces', () => {
    it('should find open places for a specific day', async () => {
      const result = await repository.findOpenPlaces('monday');

      expect(model.find).toHaveBeenCalledWith({
        isActive: true,
        'schedules.monday.closed': false,
      });
      expect(result).toEqual([mockCulturalPlace]);
    });
  });
});
