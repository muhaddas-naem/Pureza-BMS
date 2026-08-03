/**
 * Database Initial Seed Service
 *
 * Responsibilities:
 * - Seeds initial default system records (Users, Categories, Products, Customers, Orders, Expenses, Settings, Inventory Logs, Activity Logs)
 * - Ensures DB stores initial domain records upon startup across all storage drivers.
 */

import { DatabaseManager } from './database';
import { TABLE_NAMES } from './schema';
import {
  initialUsersList,
  initialCategories,
  initialProducts,
  initialCustomers,
  initialOrders,
  initialExpenses,
  initialInventoryLogs,
  initialActivityLogs,
  initialSettings,
  initialSuppliers,
  initialNotes,
} from '../../client/data/mockData';
import { dbConnection } from './connection';

export async function seedInitialData(db: DatabaseManager): Promise<void> {
  const storage = dbConnection.getStorage();

  if (!storage.has(TABLE_NAMES.USERS) || (storage.get(TABLE_NAMES.USERS) || []).length === 0) {
    storage.set(TABLE_NAMES.USERS, [...initialUsersList]);
  }

  if (!storage.has(TABLE_NAMES.CATEGORIES) || (storage.get(TABLE_NAMES.CATEGORIES) || []).length === 0) {
    storage.set(TABLE_NAMES.CATEGORIES, [...initialCategories]);
  }

  if (!storage.has(TABLE_NAMES.PRODUCTS) || (storage.get(TABLE_NAMES.PRODUCTS) || []).length === 0) {
    storage.set(TABLE_NAMES.PRODUCTS, [...initialProducts]);
  }

  if (!storage.has(TABLE_NAMES.CUSTOMERS) || (storage.get(TABLE_NAMES.CUSTOMERS) || []).length === 0) {
    storage.set(TABLE_NAMES.CUSTOMERS, [...initialCustomers]);
  }

  if (!storage.has(TABLE_NAMES.ORDERS) || (storage.get(TABLE_NAMES.ORDERS) || []).length === 0) {
    storage.set(TABLE_NAMES.ORDERS, [...initialOrders]);
  }

  if (!storage.has(TABLE_NAMES.EXPENSES) || (storage.get(TABLE_NAMES.EXPENSES) || []).length === 0) {
    storage.set(TABLE_NAMES.EXPENSES, [...initialExpenses]);
  }

  if (!storage.has(TABLE_NAMES.INVENTORY_LOGS) || (storage.get(TABLE_NAMES.INVENTORY_LOGS) || []).length === 0) {
    storage.set(TABLE_NAMES.INVENTORY_LOGS, [...initialInventoryLogs]);
  }

  if (!storage.has(TABLE_NAMES.ACTIVITY_LOGS) || (storage.get(TABLE_NAMES.ACTIVITY_LOGS) || []).length === 0) {
    storage.set(TABLE_NAMES.ACTIVITY_LOGS, [...initialActivityLogs]);
  }

  if (!storage.has(TABLE_NAMES.SETTINGS) || (storage.get(TABLE_NAMES.SETTINGS) || []).length === 0) {
    storage.set(TABLE_NAMES.SETTINGS, [initialSettings]);
  }

  if (!storage.has(TABLE_NAMES.SUPPLIERS) || (storage.get(TABLE_NAMES.SUPPLIERS) || []).length === 0) {
    storage.set(TABLE_NAMES.SUPPLIERS, [...initialSuppliers]);
  }

  if (!storage.has(TABLE_NAMES.NOTES) || (storage.get(TABLE_NAMES.NOTES) || []).length === 0) {
    storage.set(TABLE_NAMES.NOTES, [...initialNotes]);
  }

  console.log('[Seed] Database successfully seeded with domain records.');
}
