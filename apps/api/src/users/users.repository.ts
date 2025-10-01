import { Injectable } from '@nestjs/common';
import { existsSync, promises as fs } from 'fs';
import path from 'path';
import type { User, UserDraft } from '@pdr/shared';
import { baseUserSchema } from '@pdr/shared';

const DATA_FILE = (() => {
  const candidates = [
    path.resolve(__dirname, 'data', 'users.json'),
    path.resolve(__dirname, '..', 'data', 'users.json'),
    path.resolve(process.cwd(), 'apps/api/src/data/users.json'),
  ];

  for (const file of candidates) {
    if (existsSync(file)) {
      return file;
    }
  }

  return candidates[0];
})();

@Injectable()
export class UsersRepository {
  private cache = new Map<number, User>();
  private loaded = false;
  private writeLock = Promise.resolve();

  async findAll(): Promise<User[]> {
    await this.ensureLoaded();
    return Array.from(this.cache.values()).sort((a, b) => a.id - b.id);
  }

  async findById(id: number): Promise<User | undefined> {
    await this.ensureLoaded();
    return this.cache.get(id);
  }

  async create(dto: UserDraft): Promise<User> {
    await this.ensureLoaded();
    const nextId = Math.max(0, ...this.cache.keys()) + 1;
    const record: User = baseUserSchema.parse({ ...dto, id: nextId });
    this.cache.set(record.id, record);
    await this.persist();
    return record;
  }

  async update(id: number, dto: UserDraft): Promise<User | undefined> {
    await this.ensureLoaded();
    if (!this.cache.has(id)) {
      return undefined;
    }

    const record: User = baseUserSchema.parse({ ...dto, id });
    this.cache.set(id, record);
    await this.persist();
    return record;
  }

  async delete(id: number): Promise<boolean> {
    await this.ensureLoaded();
    const removed = this.cache.delete(id);
    if (!removed) {
      return false;
    }

    await this.persist();
    return true;
  }

  private async ensureLoaded(): Promise<void> {
    if (this.loaded) {
      return;
    }

    try {
      const file = await fs.readFile(DATA_FILE, 'utf8');
      const parsed = JSON.parse(file) as unknown;
      const users = Array.isArray(parsed) ? parsed : [];
      for (const raw of users) {
        const user = baseUserSchema.safeParse(raw);
        if (user.success) {
          this.cache.set(user.data.id, user.data);
        }
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
      await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
      await fs.writeFile(DATA_FILE, '[]', 'utf8');
    }

    this.loaded = true;
  }

  private async persist(): Promise<void> {
    this.writeLock = this.writeLock.then(async () => {
      await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
      const payload = JSON.stringify(Array.from(this.cache.values()), null, 2);
      await fs.writeFile(DATA_FILE, payload, 'utf8');
    });

    await this.writeLock;
  }
}
