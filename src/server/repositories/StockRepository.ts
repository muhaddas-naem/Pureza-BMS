/**
 * Stock / Inventory Repository
 *
 * Folder: src/server/repositories/
 * Description: Data access layer for Inventory Movements, Adjustments, and Stock Logs.
 */

import { InventoryLog } from '../../types';
import { dbManager } from '../database/database';
import { dbConnection } from '../database/connection';
import { TABLE_NAMES } from '../database/schema';

export interface IStockRepository {
  findAllLogs(): Promise<InventoryLog[]>;
  findLogsByProduct(productId: string): Promise<InventoryLog[]>;
  createLog(log: InventoryLog): Promise<InventoryLog>;
}

export class StockRepository implements IStockRepository {
  private tableName = TABLE_NAMES.INVENTORY_LOGS;

  public async findAllLogs(): Promise<InventoryLog[]> {
    const storage = dbConnection.getStorage();
    return (storage.get(this.tableName) || []) as InventoryLog[];
  }

  public async findLogsByProduct(productId: string): Promise<InventoryLog[]> {
    const logs = await this.findAllLogs();
    return logs.filter((l) => l.productId === productId);
  }

  public async createLog(log: InventoryLog): Promise<InventoryLog> {
    const logs = await this.findAllLogs();
    logs.push(log);
    dbConnection.getStorage().set(this.tableName, logs);
    await dbManager.execute(`INSERT INTO ${this.tableName} (id, product_id, type) VALUES (?, ?, ?)`, [
      log.id,
      log.productId,
      log.type,
    ]);
    return log;
  }
}

export const stockRepository = new StockRepository();
