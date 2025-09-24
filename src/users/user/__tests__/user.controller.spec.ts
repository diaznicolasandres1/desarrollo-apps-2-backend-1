import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../user.controller';
import { UserService } from '../user.service';
import { User } from '../../user.schema';
import { LoginDto } from '../../dto/login.dto';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

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

  const mockUserService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    loginOrCreate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      mockUserService.create.mockResolvedValue(mockUser);

      const result = await controller.create(createUserDto);

      expect(service.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(mockUser);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users = [mockUser];
      mockUserService.findAll.mockResolvedValue(users);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(users);
    });

    it('should return empty array when no users exist', async () => {
      mockUserService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const userId = '507f1f77bcf86cd799439011';
      mockUserService.findOne.mockResolvedValue(mockUser);

      const result = await controller.findOne(userId);

      expect(service.findOne).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      const userId = 'nonexistent';
      mockUserService.findOne.mockResolvedValue(null);

      const result = await controller.findOne(userId);

      expect(service.findOne).toHaveBeenCalledWith(userId);
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

      const updatedUser = { ...mockUser, ...updateUserDto };
      mockUserService.update.mockResolvedValue(updatedUser);

      const result = await controller.update(userId, updateUserDto);

      expect(service.update).toHaveBeenCalledWith(userId, updateUserDto);
      expect(result).toEqual(updatedUser);
    });

    it('should return null when user not found for update', async () => {
      const userId = 'nonexistent';
      const updateUserDto = { name: 'Updated User' };

      mockUserService.update.mockResolvedValue(null);

      const result = await controller.update(userId, updateUserDto);

      expect(service.update).toHaveBeenCalledWith(userId, updateUserDto);
      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const userId = '507f1f77bcf86cd799439011';
      mockUserService.remove.mockResolvedValue(mockUser);

      const result = await controller.remove(userId);

      expect(service.remove).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found for removal', async () => {
      const userId = 'nonexistent';
      mockUserService.remove.mockResolvedValue(null);

      const result = await controller.remove(userId);

      expect(service.remove).toHaveBeenCalledWith(userId);
      expect(result).toBeNull();
    });
  });

  describe('loginWithoutPassword', () => {
    it('should login existing user successfully', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
      };

      mockUserService.loginOrCreate.mockResolvedValue(mockUser);

      const result = await controller.loginWithoutPassword(loginDto);

      expect(service.loginOrCreate).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(mockUser);
    });

    it('should create new user and login when user does not exist', async () => {
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

      mockUserService.loginOrCreate.mockResolvedValue(newUser);

      const result = await controller.loginWithoutPassword(loginDto);

      expect(service.loginOrCreate).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(newUser);
      expect(result.name).toBe('newuser');
      expect(result.role).toBe('user');
    });
  });
});
