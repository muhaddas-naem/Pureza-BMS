/**
 * Order Repository
 *
 * Folder: src/server/repositories/
 * Description: Data access layer for Order processing, line items, and fulfillment tracking.
 */

import { Order, OrderStatus } from '../../types';
import { dbManager } from '../database/database';
import { dbConnection } from '../database/connection';
import { TABLE_NAMES } from '../database/schema';

export interface IOrderRepository {
  findAll(): Promise<Order[]>;
  findById(id: string): Promise<Order | null>;
  findByOrderNumber(orderNumber: string): Promise<Order | null>;
  findByCustomer(customerId: string): Promise<Order[]>;
  create(order: Order): Promise<Order>;
  update(id: string, updates: Partial<Order>): Promise<Order | null>;
  updateStatus(id: string, status: OrderStatus, updatedBy: string, notes?: string): Promise<Order | null>;
  delete(id: string): Promise<boolean>;
}

export class OrderRepository implements IOrderRepository {
  private tableName = TABLE_NAMES.ORDERS;

  public async findAll(): Promise<Order[]> {
    const storage = dbConnection.getStorage();
    return (storage.get(this.tableName) || []) as Order[];
  }

  public async findById(id: string): Promise<Order | null> {
    const orders = await this.findAll();
    return orders.find((o) => o.id === id) || null;
  }

  public async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    const orders = await this.findAll();
    return orders.find((o) => o.orderNumber.toLowerCase() === orderNumber.toLowerCase()) || null;
  }

  public async findByCustomer(customerId: string): Promise<Order[]> {
    const orders = await this.findAll();
    return orders.filter((o) => o.customerId === customerId);
  }

  public async create(order: Order): Promise<Order> {
    const orders = await this.findAll();
    orders.push(order);
    dbConnection.getStorage().set(this.tableName, orders);
    await dbManager.execute(
      `INSERT INTO ${this.tableName} (id, order_number, grand_total) VALUES (?, ?, ?)`,
      [order.id, order.orderNumber, order.grandTotal]
    );
    return order;
  }

  public async update(id: string, updates: Partial<Order>): Promise<Order | null> {
    const orders = await this.findAll();
    const index = orders.findIndex((o) => o.id === id);
    if (index === -1) return null;

    orders[index] = { ...orders[index], ...updates };
    dbConnection.getStorage().set(this.tableName, orders);
    return orders[index];
  }

  public async updateStatus(
    id: string,
    status: OrderStatus,
    updatedBy: string,
    notes?: string
  ): Promise<Order | null> {
    const order = await this.findById(id);
    if (!order) return null;

    const historyItem = {
      status,
      timestamp: new Date().toLocaleString(),
      updatedBy,
      notes,
    };

    const statusHistory = [...(order.statusHistory || []), historyItem];
    return this.update(id, { orderStatus: status, statusHistory });
  }

  public async delete(id: string): Promise<boolean> {
    const orders = await this.findAll();
    const filtered = orders.filter((o) => o.id !== id);
    if (filtered.length === orders.length) return false;

    dbConnection.getStorage().set(this.tableName, filtered);
    return true;
  }
}

export const orderRepository = new OrderRepository();
