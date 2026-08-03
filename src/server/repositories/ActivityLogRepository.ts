/**
 * Activity Log Repository
 *
 * Folder: src/server/repositories/
 * Description: Data access layer for System Activity Auditing.
 */

import { ActivityLog } from '../../types';
import { dbManager } from '../database/database';
import { dbConnection } from '../database/connection';
import { TABLE_NAMES } from '../database/schema';

export interface IActivityLogRepository {
  findAll(): Promise<ActivityLog[]>;
  create(log: ActivityLog): Promise<ActivityLog>;
}

export class ActivityLogRepository implements IActivityLogRepository {
  private tableName = TABLE_NAMES.ACTIVITY_LOGS;

  public async findAll(): Promise<ActivityLog[]> {
    const storage = dbConnection.getStorage();
    return (storage.get(this.tableName) || []) as ActivityLog[];
  }

  public async create(log: ActivityLog): Promise<ActivityLog> {
    const logs = await this.findAll();
    logs.unshift(log); // Keep newest logs at the top
    dbConnection.getStorage().set(this.tableName, logs);
    await dbManager.execute(`INSERT INTO ${this.tableName} (id, user_name, action) VALUES (?, ?, ?)`, [
      log.id,
      log.userName,
      log.action,
    ]);
    return log;
  }
}

export const activityLogRepository = new ActivityLogRepository();
