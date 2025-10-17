import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { GoogleStrategy } from '../strategies/google.strategy';
import { JwtStrategy } from '../strategies/jwt.strategy';
import { UserService } from '../../users/user/user.service';

describe('GoogleStrategy', () => {
  let strategy: GoogleStrategy;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoogleStrategy,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              switch (key) {
                case 'GOOGLE_CLIENT_ID':
                  return 'test-client-id';
                case 'GOOGLE_CLIENT_SECRET':
                  return 'test-client-secret';
                case 'GOOGLE_CALLBACK_URL':
                  return 'http://localhost:3000/api/v1/auth/google/callback';
                default:
                  return '';
              }
            }),
          },
        },
      ],
    }).compile();

    strategy = module.get<GoogleStrategy>(GoogleStrategy);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with correct configuration', () => {
      mockConfigService.get.mockImplementation((key: string) => {
        switch (key) {
          case 'GOOGLE_CLIENT_ID':
            return 'test-client-id';
          case 'GOOGLE_CLIENT_SECRET':
            return 'test-client-secret';
          case 'GOOGLE_CALLBACK_URL':
            return 'http://localhost:3000/api/v1/auth/google/callback';
          default:
            return '';
        }
      });

      expect(configService.get).toHaveBeenCalledWith('GOOGLE_CLIENT_ID');
      expect(configService.get).toHaveBeenCalledWith('GOOGLE_CLIENT_SECRET');
      expect(configService.get).toHaveBeenCalledWith('GOOGLE_CALLBACK_URL');
    });
  });

  describe('validate', () => {
    const mockProfile = {
      id: 'google_user_id',
      emails: [{ value: 'test@example.com', verified: true }],
      name: {
        givenName: 'John',
        familyName: 'Doe',
      },
      photos: [{ value: 'https://example.com/photo.jpg' }],
    };

    const mockAccessToken = 'access_token';
    const mockRefreshToken = 'refresh_token';
    const mockDone = jest.fn();

    it('should validate Google profile and return user data', async () => {
      await strategy.validate(mockAccessToken, mockRefreshToken, mockProfile, mockDone);

      expect(mockDone).toHaveBeenCalledWith(null, {
        googleId: 'google_user_id',
        email: 'test@example.com',
        name: 'John Doe',
        profilePicture: 'https://example.com/photo.jpg',
        isGoogleUser: true,
      });
    });

    it('should handle profile without photos', async () => {
      const profileWithoutPhotos = { ...mockProfile, photos: [] };

      await strategy.validate(mockAccessToken, mockRefreshToken, profileWithoutPhotos, mockDone);

      expect(mockDone).toHaveBeenCalledWith(null, {
        googleId: 'google_user_id',
        email: 'test@example.com',
        name: 'John Doe',
        profilePicture: undefined,
        isGoogleUser: true,
      });
    });
  });
});

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let configService: ConfigService;
  let userService: UserService;

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockUserService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    configService = module.get<ConfigService>(ConfigService);
    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with correct configuration', () => {
      mockConfigService.get.mockReturnValue('test-jwt-secret');

      expect(configService.get).toHaveBeenCalledWith('JWT_SECRET');
    });
  });

  describe('validate', () => {
    const mockPayload = {
      sub: 'user_id',
      email: 'test@example.com',
      name: 'John Doe',
      role: 'user',
      isGoogleUser: true,
    };

    const mockUser = {
      _id: 'user_id',
      email: 'test@example.com',
      name: 'John Doe',
      role: 'user',
      isGoogleUser: true,
    };

    it('should validate JWT payload and return user', async () => {
      mockUserService.findOne.mockResolvedValue(mockUser);

      const result = await strategy.validate(mockPayload);

      expect(userService.findOne).toHaveBeenCalledWith('user_id');
      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockUserService.findOne.mockResolvedValue(null);

      await expect(strategy.validate(mockPayload)).rejects.toThrow('Usuario no encontrado');
      expect(userService.findOne).toHaveBeenCalledWith('user_id');
    });
  });
});
