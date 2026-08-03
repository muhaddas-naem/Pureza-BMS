/**
 * System Settings Repository
 *
 * Folder: src/server/repositories/
 * Description: Data access layer for Global Company & System Settings.
 */

import { SystemSettings } from '../../types';
import { dbManager } from '../database/database';
import { dbConnection } from '../database/connection';
import { TABLE_NAMES } from '../database/schema';

export interface ISettingsRepository {
  getSettings(): Promise<SystemSettings | null>;
  updateSettings(settings: Partial<SystemSettings>): Promise<SystemSettings>;
}

export class SettingsRepository implements ISettingsRepository {
  private tableName = TABLE_NAMES.SETTINGS;

  public async getSettings(): Promise<SystemSettings | null> {
    const storage = dbConnection.getStorage();
    const list = storage.get(this.tableName) || [];
    return list[0] || null;
  }

  public async updateSettings(updates: Partial<SystemSettings>): Promise<SystemSettings> {
    const current = (await this.getSettings()) || {
      companyName: 'Pureza',
      phone: '',
      email: '',
      address: '',
      orderPrefix: 'PBMS-ORD-',
      invoicePrefix: 'PBMS-INV-',
      deliveryChargeInsideDhaka: 80,
      deliveryChargeOutsideDhaka: 150,
      paymentMethods: ['bKash', 'Nagad', 'Cash on Delivery'],
      couriers: ['Pathao', 'Steadfast'],
      darkMode: false,
    };

    const updated = { ...current, ...updates };
    dbConnection.getStorage().set(this.tableName, [updated]);
    await dbManager.execute(`UPDATE ${this.tableName} SET company_name = ? WHERE id = ?`, [
      updated.companyName,
      'default',
    ]);
    return updated;
  }
}

export const settingsRepository = new SettingsRepository();
