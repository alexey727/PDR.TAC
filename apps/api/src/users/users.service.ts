import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import type { User, UserDraft } from '@pdr/shared';

@Injectable()
export class UsersService {
  constructor(private readonly repository: UsersRepository) {}

  findAll(): Promise<User[]> {
    return this.repository.findAll();
  }

  findOne(id: number): Promise<User | undefined> {
    return this.repository.findById(id);
  }

  create(dto: UserDraft): Promise<User> {
    return this.repository.create(dto);
  }
}
