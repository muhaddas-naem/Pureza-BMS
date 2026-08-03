/**
 * Customer Service
 *
 * Folder: src/services/
 * Description: Business logic layer for Customer profiles using CustomerRepository.
 */

import { customerRepository } from '../server/repositories';
import { Customer } from '../types';

export class CustomerService {
  public async getCustomers(): Promise<Customer[]> {
    return customerRepository.findAll();
  }

  public async getCustomerById(id: string): Promise<Customer | null> {
    return customerRepository.findById(id);
  }

  public async createCustomer(customer: Customer): Promise<Customer> {
    return customerRepository.create(customer);
  }

  public async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer | null> {
    return customerRepository.update(id, updates);
  }
}

export const customerService = new CustomerService();
