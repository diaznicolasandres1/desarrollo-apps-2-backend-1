import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { GoogleAuthDto } from '../dto/google-auth.dto';
import { JwtResponse } from '../jwt.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    validateGoogleUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('googleAuth', () => {
    it('should be defined', () => {
      expect(controller.googleAuth).toBeDefined();
    });
  });

  describe('googleAuthRedirect', () => {
    const mockRequest = {
      user: {
        name: 'John Doe',
        email: 'john@example.com',
        profilePicture: 'https://example.com/photo.jpg',
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
      } as GoogleAuthDto,
    };

    const mockResponse = {
      redirect: jest.fn(),
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

    beforeEach(() => {
      process.env.FRONTEND_URL = 'http://localhost:3001';
    });

    it('should redirect to frontend with token on successful authentication', async () => {
      mockAuthService.validateGoogleUser.mockResolvedValue(mockJwtResponse);

      await controller.googleAuthRedirect(mockRequest as any, mockResponse as any);

      expect(authService.validateGoogleUser).toHaveBeenCalledWith(mockRequest.user);
      expect(mockResponse.redirect).toHaveBeenCalledWith(
        'http://localhost:3001/auth/callback?token=jwt_token'
      );
    });

    it('should redirect to error page on authentication failure', async () => {
      const error = new Error('Authentication failed');
      mockAuthService.validateGoogleUser.mockRejectedValue(error);

      await controller.googleAuthRedirect(mockRequest as any, mockResponse as any);

      expect(authService.validateGoogleUser).toHaveBeenCalledWith(mockRequest.user);
      expect(mockResponse.redirect).toHaveBeenCalledWith('http://localhost:3001/auth/error');
    });

    it('should use default frontend URL when FRONTEND_URL is not set', async () => {
      delete process.env.FRONTEND_URL;
      mockAuthService.validateGoogleUser.mockResolvedValue(mockJwtResponse);

      await controller.googleAuthRedirect(mockRequest as any, mockResponse as any);

      expect(mockResponse.redirect).toHaveBeenCalledWith(
        'http://localhost:3001/auth/callback?token=jwt_token'
      );
    });
  });

  describe('getProfile', () => {
    const mockUser = {
      id: 'user_id',
      email: 'john@example.com',
      name: 'John Doe',
      role: 'user',
      isGoogleUser: true,
    };

    const mockRequest = {
      user: mockUser,
    };

    it('should return user profile', async () => {
      const result = await controller.getProfile(mockRequest as any);

      expect(result).toEqual(mockUser);
    });
  });

  describe('logout', () => {
    it('should return logout message', async () => {
      const result = await controller.logout();

      expect(result).toEqual({ message: 'Sesión cerrada exitosamente' });
    });
  });
});
