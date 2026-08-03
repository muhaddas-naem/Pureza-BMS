/**
 * Product Repository
 *
 * Folder: src/server/repositories/
 * Description: Encapsulates all database operations for Product catalog & stock counts.
 */

import { Product } from '../../types';
import { dbManager } from '../database/database';
import { dbConnection } from '../database/connection';
import { TABLE_NAMES } from '../database/schema';

export interface IProductRepository {
  findAll(): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  findBySku(sku: string): Promise<Product | null>;
  findByCategory(categoryId: string): Promise<Product[]>;
  create(product: Product): Promise<Product>;
  update(id: string, updates: Partial<Product>): Promise<Product | null>;
  updateStock(id: string, deltaQuantity: number): Promise<Product | null>;
  delete(id: string): Promise<boolean>;
}

export class ProductRepository implements IProductRepository {
  private tableName = TABLE_NAMES.PRODUCTS;

  public async findAll(): Promise<Product[]> {
    const storage = dbConnection.getStorage();
    return (storage.get(this.tableName) || []) as Product[];
  }

  public async findById(id: string): Promise<Product | null> {
    const products = await this.findAll();
    return products.find((p) => p.id === id) || null;
  }

  public async findBySku(sku: string): Promise<Product | null> {
    const products = await this.findAll();
    return products.find((p) => p.sku.toLowerCase() === sku.toLowerCase()) || null;
  }

  public async findByCategory(categoryId: string): Promise<Product[]> {
    const products = await this.findAll();
    return products.filter((p) => p.categoryId === categoryId);
  }

  public async create(product: Product): Promise<Product> {
    const products = await this.findAll();
    products.push(product);
    dbConnection.getStorage().set(this.tableName, products);
    await dbManager.execute(`INSERT INTO ${this.tableName} (id, name, sku) VALUES (?, ?, ?)`, [
      product.id,
      product.name,
      product.sku,
    ]);
    return product;
  }

  public async update(id: string, updates: Partial<Product>): Promise<Product | null> {
    const products = await this.findAll();
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) return null;

    products[index] = { ...products[index], ...updates };
    dbConnection.getStorage().set(this.tableName, products);
    return products[index];
  }

  public async updateStock(id: string, deltaQuantity: number): Promise<Product | null> {
    const product = await this.findById(id);
    if (!product) return null;

    const newStock = Math.max(0, product.currentStock + deltaQuantity);
    return this.update(id, { currentStock: newStock });
  }

  public async delete(id: string): Promise<boolean> {
    const products = await this.findAll();
    const filtered = products.filter((p) => p.id !== id);
    if (filtered.length === products.length) return false;

    dbConnection.getStorage().set(this.tableName, filtered);
    return true;
  }
}

export const productRepository = new ProductRepository();
