/**
 * User Repository
 *
 * Folder: src/server/repositories/
 * Description: Encapsulates all data access and persistence logic for User entities.
 */

import { User } from '../../types';
import { dbManager } from '../database/database';
import { dbConnection } from '../database/connection';
import { TABLE_NAMES } from '../database/schema';

export interface IUserRepository {
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(user: User): Promise<User>;
  update(id: string, user: Partial<User>): Promise<User | null>;
  delete(id: string): Promise<boolean>;
}

export class UserRepository implements IUserRepository {
  private tableName = TABLE_NAMES.USERS;

  public async findAll(): Promise<User[]> {
    const storage = dbConnection.getStorage();
    return (storage.get(this.tableName) || []) as User[];
  }

  public async findById(id: string): Promise<User | null> {
    const users = await this.findAll();
    return users.find((u) => u.id === id) || null;
  }

  public async findByEmail(email: string): Promise<User | null> {
    const users = await this.findAll();
    return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  public async create(user: User): Promise<User> {
    const users = await this.findAll();
    users.push(user);
    dbConnection.getStorage().set(this.tableName, users);
    await dbManager.execute(`INSERT INTO ${this.tableName} (id, name, email) VALUES (?, ?, ?)`, [
      user.id,
      user.name,
      user.email,
    ]);
    return user;
  }

  public async update(id: string, updates: Partial<User>): Promise<User | null> {
    const users = await this.findAll();
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) return null;

    users[index] = { ...users[index], ...updates };
    dbConnection.getStorage().set(this.tableName, users);
    return users[index];
  }

  public async delete(id: string): Promise<boolean> {
    const users = await this.findAll();
    const filtered = users.filter((u) => u.id !== id);
    if (filtered.length === users.length) return false;

    dbConnection.getStorage().set(this.tableName, filtered);
    return true;
  }
}

export const userRepository = new UserRepository();
