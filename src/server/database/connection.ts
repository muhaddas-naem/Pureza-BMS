/**
 * Database Connection Management Module
 * 
 * Responsibilities:
 * - Provides reusable connection pool for MySQL using mysql2.
 * - Reads database credentials only from environment variables via config.
 * - Manages pool lifecycle and provides health check capability.
 */

import mysql, { Pool } from 'mysql2/promise';
import { config } from '../../config';

export interface DatabaseQueryResult<T = any> {
  rows: T[];
  affectedRows?: number;
  insertId?: number | string;
}

export type DbDriverType = 'sqlite' | 'mysql' | 'postgres' | 'memory';

let mysqlPool: Pool | null = null;

export function getPool(): Pool {
  if (!mysqlPool) {
    mysqlPool = mysql.createPool({
      host: config.dbHost,
      port: config.dbPort,
      user: config.dbUser,
      password: config.dbPassword,
      database: config.dbName,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 5000,
    });
  }
  return mysqlPool;
}

export interface ConnectionStatusResult {
  connected: boolean;
  database: string;
  error?: any;
}

function unwrapError(err: any): any {
  let current = err;
  while (
    current &&
    (current.name === 'AggregateError' ||
      (typeof current === 'object' && Array.isArray(current.errors) && current.errors.length > 0))
  ) {
    current = current.errors[0];
  }
  return current || err;
}

export async function checkMySqlConnection(): Promise<ConnectionStatusResult> {
  try {
    const pool = getPool();
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    return {
      connected: true,
      database: config.dbName,
    };
  } catch (err: any) {
    const rawErr = unwrapError(err);
    const isDev = process.env.NODE_ENV !== 'production';

    const errorDetails: Record<string, any> = {
      message: rawErr?.message || rawErr?.sqlMessage || String(rawErr),
      code: rawErr?.code ?? null,
      errno: rawErr?.errno ?? null,
      sqlState: rawErr?.sqlState ?? null,
      sqlMessage: rawErr?.sqlMessage ?? null,
    };

    if (isDev) {
      errorDetails.stack = rawErr?.stack || err?.stack || null;
    }

    return {
      connected: false,
      database: config.dbName,
      error: errorDetails,
    };
  }
}

export class DatabaseConnection {
  private driver: DbDriverType;
  private isConnected: boolean = false;
  private inMemoryStorage: Map<string, any[]> = new Map();

  constructor() {
    this.driver = (config.dbDriver as DbDriverType) || 'mysql';
  }

  public async connect(): Promise<void> {
    if (this.isConnected) return;

    console.log(`[DatabaseConnection] Initializing connection with driver: "${this.driver}"`);
    console.log(`[DatabaseConnection] Target MySQL host: ${config.dbHost}:${config.dbPort}, Database: ${config.dbName}`);

    const status = await checkMySqlConnection();
    if (status.connected) {
      console.log(`[DatabaseConnection] Successfully connected to MySQL database: ${config.dbName}`);
    } else {
      const errMessage = typeof status.error === 'object' ? status.error.message : status.error;
      console.warn(`[DatabaseConnection] MySQL Connection attempt result: connected=false, error="${errMessage}"`);
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
    if (mysqlPool) {
      await mysqlPool.end();
      mysqlPool = null;
    }
    this.isConnected = false;
  }
}

export const dbConnection = new DatabaseConnection();

