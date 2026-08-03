/**
 * Expense Repository
 *
 * Folder: src/server/repositories/
 * Description: Data access layer for Business Operating Expenses & Categories.
 */

import { Expense, ExpenseCategory } from '../../types';
import { dbManager } from '../database/database';
import { dbConnection } from '../database/connection';
import { TABLE_NAMES } from '../database/schema';

export interface IExpenseRepository {
  findAll(): Promise<Expense[]>;
  findById(id: string): Promise<Expense | null>;
  findCategories(): Promise<ExpenseCategory[]>;
  create(expense: Expense): Promise<Expense>;
  update(id: string, updates: Partial<Expense>): Promise<Expense | null>;
  delete(id: string): Promise<boolean>;
}

export class ExpenseRepository implements IExpenseRepository {
  private tableName = TABLE_NAMES.EXPENSES;
  private categoriesTable = TABLE_NAMES.EXPENSE_CATEGORIES;

  public async findAll(): Promise<Expense[]> {
    const storage = dbConnection.getStorage();
    return (storage.get(this.tableName) || []) as Expense[];
  }

  public async findById(id: string): Promise<Expense | null> {
    const expenses = await this.findAll();
    return expenses.find((e) => e.id === id) || null;
  }

  public async findCategories(): Promise<ExpenseCategory[]> {
    const storage = dbConnection.getStorage();
    return (storage.get(this.categoriesTable) || []) as ExpenseCategory[];
  }

  public async create(expense: Expense): Promise<Expense> {
    const expenses = await this.findAll();
    expenses.push(expense);
    dbConnection.getStorage().set(this.tableName, expenses);
    await dbManager.execute(`INSERT INTO ${this.tableName} (id, title, amount) VALUES (?, ?, ?)`, [
      expense.id,
      expense.title,
      expense.amount,
    ]);
    return expense;
  }

  public async update(id: string, updates: Partial<Expense>): Promise<Expense | null> {
    const expenses = await this.findAll();
    const index = expenses.findIndex((e) => e.id === id);
    if (index === -1) return null;

    expenses[index] = { ...expenses[index], ...updates };
    dbConnection.getStorage().set(this.tableName, expenses);
    return expenses[index];
  }

  public async delete(id: string): Promise<boolean> {
    const expenses = await this.findAll();
    const filtered = expenses.filter((e) => e.id !== id);
    if (filtered.length === expenses.length) return false;

    dbConnection.getStorage().set(this.tableName, filtered);
    return true;
  }
}

export const expenseRepository = new ExpenseRepository();
