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

  async update(id: number, dto: UserDraft): Promise<User | undefined> {
    return this.repository.update(id, dto);
  }

  delete(id: number): Promise<boolean> {
    return this.repository.delete(id);
  }
}
