import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';
import { GoogleAuthDto } from './dto/google-auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('google')
  @Public()
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ 
    summary: 'Iniciar autenticación con Google',
    description: 'Redirige al usuario a Google OAuth2 para autenticación'
  })
  @ApiResponse({ 
    status: 302, 
    description: 'Redirección a Google OAuth2' 
  })
  async googleAuth(@Req() req: Request) {}

  @Get('google/callback')
  @Public()
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ 
    summary: 'Callback de Google OAuth2',
    description: 'Endpoint que maneja la respuesta de Google después de la autenticación'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Autenticación exitosa, redirige con token JWT' 
  })
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    try {
      const googleData: GoogleAuthDto = req.user as GoogleAuthDto;
      const result = await this.authService.validateGoogleUser(googleData);
      
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
      const redirectUrl = `${frontendUrl}/auth/callback?token=${result.access_token}`;
      
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('Error en Google Auth Callback:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
      res.redirect(`${frontendUrl}/auth/error`);
    }
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Obtener perfil del usuario autenticado',
    description: 'Retorna la información del usuario actualmente autenticado'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Perfil del usuario' 
  })
  async getProfile(@Req() req: Request) {
    return req.user;
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Cerrar sesión',
    description: 'Invalida la sesión del usuario (el frontend debe eliminar el token)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Sesión cerrada exitosamente' 
  })
  async logout() {
    return { message: 'Sesión cerrada exitosamente' };
  }
}
