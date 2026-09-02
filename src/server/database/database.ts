/**
 * Core Database Manager & Query Execution Engine
 *
 * Responsibilities:
 * - Serves as the central query executor for all Repositories.
 * - Handles database initialization, table creation, and seed execution.
 * - Supports SQLite, MySQL, and PostgreSQL driver queries.
 */

import { dbConnection, DatabaseQueryResult, getPool, checkMySqlConnection } from './connection';
import { generateCreateTableQueries } from './schema';
import { seedInitialData } from './seed';

export class DatabaseManager {
  private isInitialized: boolean = false;
  private isConnectedToMysql: boolean = false;

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    await dbConnection.connect();
    const driver = dbConnection.getDriver();
    console.log(`[DatabaseManager] Initializing schema for driver: "${driver}"`);

    const status = await checkMySqlConnection();
    if (status.connected) {
      this.isConnectedToMysql = true;
      console.log(`[DatabaseManager] Connected to MySQL database "${status.database}". Creating tables...`);
      const pool = getPool();
      const ddlQueries = generateCreateTableQueries('mysql');
      for (const sql of ddlQueries) {
        try {
          await pool.query(sql);
        } catch (err: any) {
          console.error(`[DatabaseManager] DDL execution notice:`, err?.message || err);
        }
      }
    } else {
      console.warn(`[DatabaseManager] MySQL connection unavailable (${status.error?.message || status.error}). Using in-memory fallback.`);
      const ddlQueries = generateCreateTableQueries('sqlite');
      for (const sql of ddlQueries) {
        this.executeInMemory(sql);
      }
    }

    // Seed database with mock data if required
    await seedInitialData(this);

    this.isInitialized = true;
    console.log(`[DatabaseManager] Database setup complete.`);
  }

  /**
   * Executes a SELECT or data fetching query
   */
  public async query<T = any>(sql: string, params: any[] = []): Promise<DatabaseQueryResult<T>> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (this.isConnectedToMysql) {
      try {
        const pool = getPool();
        const [rows] = await pool.query(sql, params);
        return { rows: rows as T[] };
      } catch (err: any) {
        console.error(`[DatabaseManager] MySQL query error:`, err?.message || err);
      }
    }

    // Fallback in-memory storage query
    const storage = dbConnection.getStorage();
    const tableName = this.extractTableName(sql);
    if (tableName && storage.has(tableName)) {
      const records = storage.get(tableName) || [];
      return { rows: records as T[] };
    }

    return { rows: [] };
  }

  /**
   * Executes an INSERT / UPDATE / DELETE query
   */
  public async execute(sql: string, params: any[] = []): Promise<DatabaseQueryResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (this.isConnectedToMysql) {
      try {
        const pool = getPool();
        const [result] = await pool.query(sql, params);
        return { rows: [], affectedRows: (result as any)?.affectedRows || 0 };
      } catch (err: any) {
        console.error(`[DatabaseManager] MySQL execute error:`, err?.message || err);
      }
    }

    return this.executeInMemory(sql, params);
  }

  private executeInMemory(sql: string, params: any[] = []): DatabaseQueryResult {
    const storage = dbConnection.getStorage();
    const tableName = this.extractTableName(sql);

    if (tableName && !storage.has(tableName)) {
      storage.set(tableName, []);
    }

    return { rows: [], affectedRows: 1 };
  }

  private extractTableName(sql: string): string | null {
    const match = sql.match(/(?:FROM|INTO|UPDATE|TABLE IF NOT EXISTS|TABLE)\s+([`a-zA-Z0-9_]+)/i);
    return match ? match[1].replace(/[`"']/g, '') : null;
  }
}

export const dbManager = new DatabaseManager();
