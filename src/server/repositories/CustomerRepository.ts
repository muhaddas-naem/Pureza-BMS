/**
 * Customer Repository
 *
 * Folder: src/server/repositories/
 * Description: Data access layer for Customer profiles, purchase history and totals.
 */

import { Customer } from '../../types';
import { dbManager } from '../database/database';
import { dbConnection } from '../database/connection';
import { TABLE_NAMES } from '../database/schema';

export interface ICustomerRepository {
  findAll(): Promise<Customer[]>;
  findById(id: string): Promise<Customer | null>;
  findByPhone(phone: string): Promise<Customer | null>;
  create(customer: Customer): Promise<Customer>;
  update(id: string, updates: Partial<Customer>): Promise<Customer | null>;
  recordPurchase(id: string, orderAmount: number, orderDate: string): Promise<Customer | null>;
  delete(id: string): Promise<boolean>;
}

export class CustomerRepository implements ICustomerRepository {
  private tableName = TABLE_NAMES.CUSTOMERS;

  public async findAll(): Promise<Customer[]> {
    const storage = dbConnection.getStorage();
    return (storage.get(this.tableName) || []) as Customer[];
  }

  public async findById(id: string): Promise<Customer | null> {
    const customers = await this.findAll();
    return customers.find((c) => c.id === id) || null;
  }

  public async findByPhone(phone: string): Promise<Customer | null> {
    const customers = await this.findAll();
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    return customers.find((c) => c.phone.replace(/[^0-9]/g, '') === cleanPhone) || null;
  }

  public async create(customer: Customer): Promise<Customer> {
    const customers = await this.findAll();
    customers.push(customer);
    dbConnection.getStorage().set(this.tableName, customers);
    await dbManager.execute(`INSERT INTO ${this.tableName} (id, name, phone) VALUES (?, ?, ?)`, [
      customer.id,
      customer.name,
      customer.phone,
    ]);
    return customer;
  }

  public async update(id: string, updates: Partial<Customer>): Promise<Customer | null> {
    const customers = await this.findAll();
    const index = customers.findIndex((c) => c.id === id);
    if (index === -1) return null;

    customers[index] = { ...customers[index], ...updates };
    dbConnection.getStorage().set(this.tableName, customers);
    return customers[index];
  }

  public async recordPurchase(id: string, orderAmount: number, orderDate: string): Promise<Customer | null> {
    const customer = await this.findById(id);
    if (!customer) return null;

    return this.update(id, {
      totalOrders: (customer.totalOrders || 0) + 1,
      totalSpent: (customer.totalSpent || 0) + orderAmount,
      lastOrderDate: orderDate,
    });
  }

  public async delete(id: string): Promise<boolean> {
    const customers = await this.findAll();
    const filtered = customers.filter((c) => c.id !== id);
    if (filtered.length === customers.length) return false;

    dbConnection.getStorage().set(this.tableName, filtered);
    return true;
  }
}

export const customerRepository = new CustomerRepository();
