/**
 * User Service
 *
 * Folder: src/services/
 * Description: Business logic layer for Users & Authentication using UserRepository.
 */

import { userRepository } from '../server/repositories';
import { User } from '../types';

export class UserService {
  public async getUsers(): Promise<User[]> {
    return userRepository.findAll();
  }

  public async getUserById(id: string): Promise<User | null> {
    return userRepository.findById(id);
  }

  public async createUser(user: User): Promise<User> {
    return userRepository.create(user);
  }
}

export const userService = new UserService();
