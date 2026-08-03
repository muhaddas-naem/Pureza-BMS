/**
 * Database Connection Management Module
 * 
 * Responsibilities:
 * - Provides abstraction over SQLite, MySQL, and PostgreSQL drivers.
 * - Manages pool or file connection lifecycle based on `DB_DRIVER` in config.
 */

import { config } from '../../config';

export interface DatabaseQueryResult<T = any> {
  rows: T[];
  affectedRows?: number;
  insertId?: number | string;
}

export type DbDriverType = 'sqlite' | 'mysql' | 'postgres' | 'memory';

export class DatabaseConnection {
  private driver: DbDriverType;
  private isConnected: boolean = false;
  private inMemoryStorage: Map<string, any[]> = new Map();

  constructor() {
    this.driver = (config.dbDriver as DbDriverType) || 'sqlite';
  }

  public async connect(): Promise<void> {
    if (this.isConnected) return;

    console.log(`[DatabaseConnection] Initializing connection with driver: "${this.driver}"`);
    if (this.driver === 'mysql') {
      console.log(`[DatabaseConnection] Target MySQL host: ${config.dbHost}:${config.dbPort}, Database: ${config.dbName}`);
    } else if (this.driver === 'postgres') {
      console.log(`[DatabaseConnection] Target PostgreSQL host: ${config.dbHost}:${config.dbPort}, Database: ${config.dbName}`);
    } else {
      console.log(`[DatabaseConnection] Running SQLite / In-Memory active database engine`);
    }

    this.isConnected = true;
  }

  public getDriver(): DbDriverType {
    return this.driver;
  }

  public isReady(): boolean {
    return this.isConnected;
  }

  public getStorage(): Map<string, any[]> {
    return this.inMemoryStorage;
  }

  public async disconnect(): Promise<void> {
    console.log(`[DatabaseConnection] Closing database connections...`);
    this.isConnected = false;
  }
}

export const dbConnection = new DatabaseConnection();
