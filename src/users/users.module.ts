import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { MongoDBUserRepository } from './repositories/mongodb-user.repository';
import { USER_REPOSITORY } from './interfaces/user.repository.interface';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [
    UserService,
    {
      provide: USER_REPOSITORY,
      useClass: MongoDBUserRepository,
    },
  ],
  controllers: [UserController],
})
export class UsersModule {}
