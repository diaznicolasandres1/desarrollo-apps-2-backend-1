import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthJwtService, JwtPayload, JwtResponse } from '../jwt.service';
import { User } from '../../users/user.schema';

describe('AuthJwtService', () => {
  let service: AuthJwtService;
  let jwtService: JwtService;

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthJwtService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthJwtService>(AuthJwtService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateToken', () => {
    const mockUser: User = {
      _id: 'user_id' as any,
      name: 'John Doe',
      email: 'john@example.com',
      isGoogleUser: true,
      role: 'user',
      profilePicture: 'https://example.com/photo.jpg',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const expectedPayload: JwtPayload = {
      sub: 'user_id',
      email: 'john@example.com',
      name: 'John Doe',
      role: 'user',
      isGoogleUser: true,
    };

    const expectedResponse: JwtResponse = {
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

    it('should generate JWT token and return user data', async () => {
      mockJwtService.signAsync.mockResolvedValue('jwt_token');

      const result = await service.generateToken(mockUser);

      expect(jwtService.signAsync).toHaveBeenCalledWith(expectedPayload);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle user without profile picture', async () => {
      const userWithoutPicture = { ...mockUser, profilePicture: undefined };
      const expectedResponseWithoutPicture = { ...expectedResponse, user: { ...expectedResponse.user, profilePicture: undefined } };

      mockJwtService.signAsync.mockResolvedValue('jwt_token');

      const result = await service.generateToken(userWithoutPicture);

      expect(jwtService.signAsync).toHaveBeenCalledWith(expectedPayload);
      expect(result).toEqual(expectedResponseWithoutPicture);
    });
  });

  describe('verifyToken', () => {
    const mockPayload: JwtPayload = {
      sub: 'user_id',
      email: 'john@example.com',
      name: 'John Doe',
      role: 'user',
      isGoogleUser: true,
    };

    it('should verify JWT token and return payload', async () => {
      mockJwtService.verifyAsync.mockResolvedValue(mockPayload);

      const result = await service.verifyToken('jwt_token');

      expect(jwtService.verifyAsync).toHaveBeenCalledWith('jwt_token');
      expect(result).toEqual(mockPayload);
    });

    it('should throw error when token is invalid', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      await expect(service.verifyToken('invalid_token')).rejects.toThrow('Invalid token');
    });
  });
});
