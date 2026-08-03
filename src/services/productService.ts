/**
 * Product Service
 *
 * Folder: src/services/
 * Description: Business logic layer for Product operations using ProductRepository.
 */

import { productRepository, categoryRepository } from '../server/repositories';
import { Product } from '../types';

export class ProductService {
  public async getProducts(): Promise<Product[]> {
    return productRepository.findAll();
  }

  public async getProductById(id: string): Promise<Product | null> {
    return productRepository.findById(id);
  }

  public async createProduct(product: Product): Promise<Product> {
    return productRepository.create(product);
  }

  public async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    return productRepository.update(id, updates);
  }

  public async deleteProduct(id: string): Promise<boolean> {
    return productRepository.delete(id);
  }
}

export const productService = new ProductService();
