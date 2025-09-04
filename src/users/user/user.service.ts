import { Injectable, Inject } from '@nestjs/common';
import { User } from '../user.schema';
import { IUserRepository, USER_REPOSITORY } from '../interfaces/user.repository.interface';

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
}
