import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { User } from '../users/user.schema';

export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  role: string;
  isGoogleUser: boolean;
}

export interface JwtResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    isGoogleUser: boolean;
    profilePicture?: string;
  };
}

@Injectable()
export class AuthJwtService {
  constructor(private jwtService: NestJwtService) {}

  async generateToken(user: User): Promise<JwtResponse> {
    const payload: JwtPayload = {
      sub: (user as any)._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      isGoogleUser: user.isGoogleUser,
    };

    const access_token = await this.jwtService.signAsync(payload);

    return {
      access_token,
      user: {
        id: (user as any)._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        isGoogleUser: user.isGoogleUser,
        profilePicture: user.profilePicture,
      },
    };
  }

  async verifyToken(token: string): Promise<JwtPayload> {
    return this.jwtService.verifyAsync(token);
  }
}
