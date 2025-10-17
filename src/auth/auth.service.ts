import { Injectable, ConflictException } from '@nestjs/common';
import { UserService } from '../users/user/user.service';
import { AuthJwtService, JwtResponse } from './jwt.service';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { User } from '../users/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private authJwtService: AuthJwtService,
  ) {}

  async validateGoogleUser(googleData: GoogleAuthDto): Promise<JwtResponse> {
    let user = await this.userService.findByEmail(googleData.email);

    if (user) {
      if (!user.isGoogleUser) {
        user = await this.userService.update((user as any)._id.toString(), {
          ...user,
          googleId: googleData.googleId,
          isGoogleUser: true,
          profilePicture: googleData.profilePicture,
          updatedAt: new Date(),
        });
      } else {
        user = await this.userService.update((user as any)._id.toString(), {
          ...user,
          profilePicture: googleData.profilePicture,
          updatedAt: new Date(),
        });
      }
    } else {
      const newUser: Partial<User> = {
        name: googleData.name,
        email: googleData.email,
        googleId: googleData.googleId,
        isGoogleUser: true,
        profilePicture: googleData.profilePicture,
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      user = await this.userService.create(newUser as User);
    }

    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    return this.authJwtService.generateToken(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userService.findByEmail(email);
  }
}
