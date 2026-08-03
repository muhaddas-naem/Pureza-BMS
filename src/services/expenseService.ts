/**
 * Expense Service
 *
 * Folder: src/services/
 * Description: Business logic layer for Expense Tracking using ExpenseRepository.
 */

import { expenseRepository } from '../server/repositories';
import { Expense } from '../types';

export class ExpenseService {
  public async getExpenses(): Promise<Expense[]> {
    return expenseRepository.findAll();
  }

  public async createExpense(expense: Expense): Promise<Expense> {
    return expenseRepository.create(expense);
  }
}

export const expenseService = new ExpenseService();
