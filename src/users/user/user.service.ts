import { Injectable, Inject } from '@nestjs/common';
import { User } from '../user.schema';
import { USER_REPOSITORY } from '../interfaces/user.repository.interface';
import type { IUserRepository } from '../interfaces/user.repository.interface';
import { LoginDto } from '../dto/login.dto';

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY) private userRepository: IUserRepository,
  ) {}

  async create(user: User): Promise<User> {
    return this.userRepository.create(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async findOne(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async update(id: string, user: Partial<User>): Promise<User | null> {
    return this.userRepository.update(id, user);
  }

  async remove(id: string): Promise<User | null> {
    const deleted = await this.userRepository.delete(id);
    return deleted ? await this.userRepository.findById(id) : null;
  }

  async loginOrCreate(loginDto: LoginDto): Promise<User> {
    // Buscar usuario por email
    let user = await this.userRepository.findByEmail(loginDto.email);
    
    // Si no existe, crear nuevo usuario
    if (!user) {
      const newUser: User = {
        name: loginDto.email.split('@')[0], // Usar parte antes del @ como nombre por defecto
        email: loginDto.email,
        password: '', // Password vacío para usuarios universitarios
        isGoogleUser: false,
        role: 'user', // Rol por defecto para usuarios universitarios
        createdAt: new Date(),
      };
      user = await this.userRepository.create(newUser);
    }
    
    return user;
  }
}
