import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { UserProfile } from './models/users';
import { UpdateUsersDto } from './dto/update-users.dto';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  findById(userId: number): Promise<UserProfile> {
    return this.usersRepository.findById(userId);
  }

  update(changes: UpdateUsersDto, userId: number): Promise<UserProfile> {
    return this.usersRepository.update(userId, changes);
  }

  async remove(userId: number): Promise<void> {
    await this.usersRepository.delete(userId);
  }
}
