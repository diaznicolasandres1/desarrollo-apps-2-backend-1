import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { AuthJwtService, JwtResponse } from '../jwt.service';
import { UserService } from '../../users/user/user.service';
import { GoogleAuthDto } from '../dto/google-auth.dto';
import { User } from '../../users/user.schema';

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let authJwtService: AuthJwtService;

  const mockUserService = {
    findByEmail: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
  };

  const mockAuthJwtService = {
    generateToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: AuthJwtService,
          useValue: mockAuthJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    authJwtService = module.get<AuthJwtService>(AuthJwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateGoogleUser', () => {
    const googleData: GoogleAuthDto = {
      name: 'John Doe',
      email: 'john@example.com',
      profilePicture: 'https://example.com/photo.jpg',
      accessToken: 'access_token',
      refreshToken: 'refresh_token',
    };

    const mockUser: User = {
      _id: 'user_id' as any,
      name: 'John Doe',
      email: 'john@example.com',
      isGoogleUser: false,
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockJwtResponse: JwtResponse = {
      access_token: 'jwt_token',
      user: {
        id: 'user_id',
        email: 'john@example.com',
        name: 'John Doe',
        role: 'user',
        isGoogleUser: true,
        profilePicture: 'https://example.com/photo.jpg',
      },
    };

    it('should create new Google user when user does not exist', async () => {
      mockUserService.findByEmail.mockResolvedValue(null);
      mockUserService.create.mockResolvedValue(mockUser);
      mockAuthJwtService.generateToken.mockResolvedValue(mockJwtResponse);

      const result = await service.validateGoogleUser(googleData);

      expect(userService.findByEmail).toHaveBeenCalledWith(googleData.email);
      expect(userService.create).toHaveBeenCalledWith({
        name: googleData.name,
        email: googleData.email,
        googleId: undefined,
        isGoogleUser: true,
        profilePicture: googleData.profilePicture,
        role: 'user',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
      expect(authJwtService.generateToken).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockJwtResponse);
    });

    it('should update existing non-Google user to Google user', async () => {
      const existingUser = { ...mockUser, isGoogleUser: false };
      const updatedUser = { ...existingUser, isGoogleUser: true, googleId: googleData.email };

      mockUserService.findByEmail.mockResolvedValue(existingUser);
      mockUserService.update.mockResolvedValue(updatedUser);
      mockAuthJwtService.generateToken.mockResolvedValue(mockJwtResponse);

      const result = await service.validateGoogleUser(googleData);

      expect(userService.findByEmail).toHaveBeenCalledWith(googleData.email);
      expect(userService.update).toHaveBeenCalledWith('user_id', {
        ...existingUser,
        googleId: undefined,
        isGoogleUser: true,
        profilePicture: googleData.profilePicture,
        updatedAt: expect.any(Date),
      });
      expect(authJwtService.generateToken).toHaveBeenCalledWith(updatedUser);
      expect(result).toEqual(mockJwtResponse);
    });

    it('should update existing Google user profile picture', async () => {
      const existingGoogleUser = { ...mockUser, isGoogleUser: true };
      const updatedUser = { ...existingGoogleUser, profilePicture: googleData.profilePicture };

      mockUserService.findByEmail.mockResolvedValue(existingGoogleUser);
      mockUserService.update.mockResolvedValue(updatedUser);
      mockAuthJwtService.generateToken.mockResolvedValue(mockJwtResponse);

      const result = await service.validateGoogleUser(googleData);

      expect(userService.findByEmail).toHaveBeenCalledWith(googleData.email);
      expect(userService.update).toHaveBeenCalledWith('user_id', {
        ...existingGoogleUser,
        profilePicture: googleData.profilePicture,
        updatedAt: expect.any(Date),
      });
      expect(authJwtService.generateToken).toHaveBeenCalledWith(updatedUser);
      expect(result).toEqual(mockJwtResponse);
    });

    it('should throw error when user is not found after creation/update', async () => {
      mockUserService.findByEmail.mockResolvedValue(null);
      mockUserService.create.mockResolvedValue(null);
      mockAuthJwtService.generateToken.mockResolvedValue(mockJwtResponse);

      await expect(service.validateGoogleUser(googleData)).rejects.toThrow('Usuario no encontrado');
    });
  });

  describe('findByEmail', () => {
    it('should return user by email', async () => {
      const email = 'test@example.com';
      const mockUser: User = {
        _id: 'user_id' as any,
        name: 'John Doe',
        email: 'john@example.com',
        isGoogleUser: true,
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockUserService.findByEmail.mockResolvedValue(mockUser);

      const result = await service.findByEmail(email);

      expect(userService.findByEmail).toHaveBeenCalledWith(email);
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      const email = 'nonexistent@example.com';
      mockUserService.findByEmail.mockResolvedValue(null);

      const result = await service.findByEmail(email);

      expect(userService.findByEmail).toHaveBeenCalledWith(email);
      expect(result).toBeNull();
    });
  });
});
