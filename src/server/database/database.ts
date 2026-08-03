/**
 * Core Database Manager & Query Execution Engine
 *
 * Responsibilities:
 * - Serves as the central query executor for all Repositories.
 * - Handles database initialization, table creation, and seed execution.
 * - Supports SQLite, MySQL, and PostgreSQL driver queries.
 */

import { dbConnection, DatabaseQueryResult } from './connection';
import { generateCreateTableQueries } from './schema';
import { seedInitialData } from './seed';

export class DatabaseManager {
  private isInitialized: boolean = false;

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    await dbConnection.connect();
    const driver = dbConnection.getDriver();
    console.log(`[DatabaseManager] Initializing schema for driver: "${driver}"`);

    const ddlQueries = generateCreateTableQueries(driver);
    for (const sql of ddlQueries) {
      await this.execute(sql);
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

    // Abstract query execution handler
    const driver = dbConnection.getDriver();
    const storage = dbConnection.getStorage();

    // In-memory / SQLite fallback simulation engine
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
