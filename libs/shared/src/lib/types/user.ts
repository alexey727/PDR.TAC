import type { User, UserRole } from '../schemas/user.schema';

export type UserDraft = Omit<User, 'id'>;

export interface PaginatedUsers {
  total: number;
  items: User[];
}

export { User, UserRole };
