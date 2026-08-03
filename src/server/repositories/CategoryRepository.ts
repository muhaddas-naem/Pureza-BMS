/**
 * Category Repository
 *
 * Folder: src/server/repositories/
 * Description: Data access layer for Product Categories.
 */

import { Category } from '../../types';
import { dbManager } from '../database/database';
import { dbConnection } from '../database/connection';
import { TABLE_NAMES } from '../database/schema';

export interface ICategoryRepository {
  findAll(): Promise<Category[]>;
  findById(id: string): Promise<Category | null>;
  create(category: Category): Promise<Category>;
  update(id: string, updates: Partial<Category>): Promise<Category | null>;
  delete(id: string): Promise<boolean>;
}

export class CategoryRepository implements ICategoryRepository {
  private tableName = TABLE_NAMES.CATEGORIES;

  public async findAll(): Promise<Category[]> {
    const storage = dbConnection.getStorage();
    return (storage.get(this.tableName) || []) as Category[];
  }

  public async findById(id: string): Promise<Category | null> {
    const categories = await this.findAll();
    return categories.find((c) => c.id === id) || null;
  }

  public async create(category: Category): Promise<Category> {
    const categories = await this.findAll();
    categories.push(category);
    dbConnection.getStorage().set(this.tableName, categories);
    await dbManager.execute(`INSERT INTO ${this.tableName} (id, name) VALUES (?, ?)`, [
      category.id,
      category.name,
    ]);
    return category;
  }

  public async update(id: string, updates: Partial<Category>): Promise<Category | null> {
    const categories = await this.findAll();
    const index = categories.findIndex((c) => c.id === id);
    if (index === -1) return null;

    categories[index] = { ...categories[index], ...updates };
    dbConnection.getStorage().set(this.tableName, categories);
    return categories[index];
  }

  public async delete(id: string): Promise<boolean> {
    const categories = await this.findAll();
    const filtered = categories.filter((c) => c.id !== id);
    if (filtered.length === categories.length) return false;

    dbConnection.getStorage().set(this.tableName, filtered);
    return true;
  }
}

export const categoryRepository = new CategoryRepository();
