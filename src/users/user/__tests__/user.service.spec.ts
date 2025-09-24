import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user.service';
import { User } from '../../user.schema';
import { IUserRepository, USER_REPOSITORY } from '../../interfaces/user.repository.interface';
import { LoginDto } from '../../dto/login.dto';

describe('UserService', () => {
  let service: UserService;
  let repository: IUserRepository;

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedpassword',
    role: 'user',
    isGoogleUser: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: USER_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<IUserRepository>(USER_REPOSITORY);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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

      mockRepository.create.mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(repository.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(mockUser);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      mockRepository.findAll.mockResolvedValue([mockUser]);

      const result = await service.findAll();

      expect(repository.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockUser]);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const userId = '507f1f77bcf86cd799439011';

      mockRepository.findById.mockResolvedValue(mockUser);

      const result = await service.findOne(userId);

      expect(repository.findById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      const result = await service.findOne('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const updateUserDto = {
        name: 'Updated User',
        email: 'updated@example.com',
      };

      mockRepository.update.mockResolvedValue(mockUser);

      const result = await service.update(userId, updateUserDto);

      expect(repository.update).toHaveBeenCalledWith(userId, updateUserDto);
      expect(result).toEqual(mockUser);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const userId = '507f1f77bcf86cd799439011';

      mockRepository.delete.mockResolvedValue(true);
      mockRepository.findById.mockResolvedValue(mockUser);

      const result = await service.remove(userId);

      expect(repository.delete).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUser);
    });
  });

  describe('loginOrCreate', () => {
    it('should return existing user when found by email', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
      };

      mockRepository.findByEmail.mockResolvedValue(mockUser);

      const result = await service.loginOrCreate(loginDto);

      expect(repository.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(result).toEqual(mockUser);
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('should create new user when not found by email', async () => {
      const loginDto: LoginDto = {
        email: 'newuser@example.com',
      };

      const newUser = {
        _id: '507f1f77bcf86cd799439012',
        name: 'newuser',
        email: 'newuser@example.com',
        password: '',
        role: 'user',
        isGoogleUser: false,
        createdAt: new Date(),
      };

      mockRepository.findByEmail.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(newUser);

      const result = await service.loginOrCreate(loginDto);

      expect(repository.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(repository.create).toHaveBeenCalledWith({
        name: 'newuser',
        email: 'newuser@example.com',
        password: '',
        isGoogleUser: false,
        role: 'user',
        createdAt: expect.any(Date),
      });
      expect(result).toEqual(newUser);
    });

    it('should extract name from email correctly', async () => {
      const loginDto: LoginDto = {
        email: 'juan.perez.garcia@universidad.edu',
      };

      const newUser = {
        _id: '507f1f77bcf86cd799439012',
        name: 'juan.perez.garcia',
        email: 'juan.perez.garcia@universidad.edu',
        password: '',
        role: 'user',
        isGoogleUser: false,
        createdAt: new Date(),
      };

      mockRepository.findByEmail.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(newUser);

      const result = await service.loginOrCreate(loginDto);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'juan.perez.garcia',
          email: 'juan.perez.garcia@universidad.edu',
          role: 'user',
        })
      );
      expect(result).toEqual(newUser);
    });

    it('should handle email with special characters in name', async () => {
      const loginDto: LoginDto = {
        email: 'test-user+tag@example.com',
      };

      const newUser = {
        _id: '507f1f77bcf86cd799439012',
        name: 'test-user+tag',
        email: 'test-user+tag@example.com',
        password: '',
        role: 'user',
        isGoogleUser: false,
        createdAt: new Date(),
      };

      mockRepository.findByEmail.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(newUser);

      const result = await service.loginOrCreate(loginDto);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'test-user+tag',
          email: 'test-user+tag@example.com',
        })
      );
      expect(result).toEqual(newUser);
    });
  });
});
