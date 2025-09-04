import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MongoDBUserRepository } from '../mongodb-user.repository';
import { User, UserDocument } from '../../user.schema';

describe('MongoDBUserRepository', () => {
  let repository: MongoDBUserRepository;
  let model: Model<UserDocument>;

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedpassword',
    isGoogleUser: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    // Crear un mock que funcione como constructor
    const MockModel = jest.fn().mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(mockUser),
    }));

    // Agregar métodos estáticos al mock
    (MockModel as any).find = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue([mockUser]),
    });
    (MockModel as any).findById = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockUser),
    });
    (MockModel as any).findOne = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockUser),
    });
    (MockModel as any).findByIdAndUpdate = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockUser),
    });
    (MockModel as any).findByIdAndDelete = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockUser),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MongoDBUserRepository,
        {
          provide: getModelToken(User.name),
          useValue: MockModel,
        },
      ],
    }).compile();

    repository = module.get<MongoDBUserRepository>(MongoDBUserRepository);
    model = module.get<Model<UserDocument>>(getModelToken(User.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        isGoogleUser: false,
        createdAt: new Date(),
      } as User;

      const result = await repository.create(createUserDto);

      expect(model).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(mockUser);
    });
  });

  describe('findAll', () => {
    it('should find all users', async () => {
      const result = await repository.findAll();

      expect(model.find).toHaveBeenCalled();
      expect(result).toEqual([mockUser]);
    });
  });

  describe('findById', () => {
    it('should find a user by id', async () => {
      const userId = '507f1f77bcf86cd799439011';

      const result = await repository.findById(userId);

      expect(model.findById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUser);
    });
  });

  describe('findByEmail', () => {
    it('should find a user by email', async () => {
      const email = 'test@example.com';

      const result = await repository.findByEmail(email);

      expect(model.findOne).toHaveBeenCalledWith({ email });
      expect(result).toEqual(mockUser);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const updateUserDto = {
        name: 'Updated User',
        email: 'updated@example.com',
      };

      const result = await repository.update(userId, updateUserDto);

      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(userId, updateUserDto, { new: true });
      expect(result).toEqual(mockUser);
    });
  });

  describe('delete', () => {
    it('should delete a user and return true', async () => {
      const userId = '507f1f77bcf86cd799439011';

      const result = await repository.delete(userId);

      expect(model.findByIdAndDelete).toHaveBeenCalledWith(userId);
      expect(result).toBe(true);
    });
  });
});
