/**
 * Order Service
 *
 * Folder: src/services/
 * Description: Business logic layer for Order processing using OrderRepository, CustomerRepository & ProductRepository.
 */

import { orderRepository, customerRepository, productRepository, activityLogRepository } from '../server/repositories';
import { Order, OrderStatus } from '../types';

export class OrderService {
  public async getOrders(): Promise<Order[]> {
    return orderRepository.findAll();
  }

  public async getOrderById(id: string): Promise<Order | null> {
    return orderRepository.findById(id);
  }

  public async createOrder(order: Order): Promise<Order> {
    const createdOrder = await orderRepository.create(order);

    const isSalesRecognized =
      order.orderStatus === 'Confirmed' ||
      order.orderStatus === 'Invoice Generated' ||
      order.orderStatus === 'Processing' ||
      order.orderStatus === 'Packed' ||
      order.orderStatus === 'Shipped' ||
      order.orderStatus === 'Delivered' ||
      order.orderStatus === 'Completed';

    // Update customer purchase history ONLY if status is Shipped, Delivered, or Completed
    if (order.customerId && isSalesRecognized) {
      await customerRepository.recordPurchase(order.customerId, order.grandTotal, order.date);
    }

    // Deduct stock for ordered items ONLY if status is Shipped, Delivered, or Completed
    if (isSalesRecognized) {
      for (const item of order.items || []) {
        if (item.productId) {
          await productRepository.updateStock(item.productId, -item.quantity);
        }
      }
    }

    // Log activity
    await activityLogRepository.create({
      id: `act-${Date.now()}`,
      userName: 'System Auto',
      action: 'নতুন অর্ডার সংযোজন',
      details: `অর্ডার #${order.orderNumber} (স্ট্যাটাস: ${order.orderStatus}) তৈরি করা হয়েছে।`,
      timestamp: new Date().toLocaleString(),
    });

    return createdOrder;
  }

  public async updateOrderStatus(
    id: string,
    status: OrderStatus,
    updatedBy: string,
    notes?: string
  ): Promise<Order | null> {
    const existing = await orderRepository.findById(id);
    const updated = await orderRepository.updateStatus(id, status, updatedBy, notes);

    if (existing && updated) {
      const prevStatus = existing.orderStatus;
      const isDeducted = (st: OrderStatus) =>
        st === 'Confirmed' ||
        st === 'Invoice Generated' ||
        st === 'Processing' ||
        st === 'Packed' ||
        st === 'Shipped' ||
        st === 'Delivered' ||
        st === 'Completed';

      const isSalesPrev = isDeducted(prevStatus);
      const isSalesNew = isDeducted(status);

      // Transition to Sales Recognized (e.g. Shipped)
      if (!isSalesPrev && isSalesNew) {
        // Deduct stock for items
        for (const item of updated.items || []) {
          if (item.productId) {
            await productRepository.updateStock(item.productId, -item.quantity);
          }
        }
        // Record customer purchase lifetime value
        if (updated.customerId) {
          await customerRepository.recordPurchase(updated.customerId, updated.grandTotal, updated.date);
        }
        // Log Sales Recognition accounting entry
        const cogs = (updated.items || []).reduce(
          (sum, item) => sum + (item.buyingPrice || 0) * item.quantity,
          0
        );
        await activityLogRepository.create({
          id: `act-${Date.now()}`,
          userName: updatedBy,
          action: 'বিক্রয় ও রাজস্ব হিসাবভুক্ত (Sales Recognition)',
          details: `অর্ডার #${updated.orderNumber} শিফট (Shipped) হওয়ায় রেভিনিউ ৳${updated.grandTotal} এবং COGS ৳${cogs} হিসাবভুক্ত করা হয়েছে।`,
          timestamp: new Date().toLocaleString(),
        });
      }
      // Reversal (Cancelled after Shipped, or Returned)
      else if (isSalesPrev && (status === 'Cancelled' || status === 'Returned')) {
        // Restore stock
        for (const item of updated.items || []) {
          if (item.productId) {
            await productRepository.updateStock(item.productId, item.quantity);
          }
        }
        // Reverse customer lifetime value
        if (updated.customerId) {
          await customerRepository.recordPurchase(updated.customerId, -updated.grandTotal, updated.date);
        }
        // Log Reversing Journal Entry
        const cogs = (updated.items || []).reduce(
          (sum, item) => sum + (item.buyingPrice || 0) * item.quantity,
          0
        );
        await activityLogRepository.create({
          id: `act-${Date.now()}`,
          userName: updatedBy,
          action: `বিপরীত হিসাববিজ্ঞান এন্ট্রি (Reversing Journal Entry - ${status})`,
          details: `অর্ডার #${updated.orderNumber} ${status === 'Returned' ? 'রিটার্ন' : 'বাতিল'} হওয়ায় ৳${updated.grandTotal} রেভিনিউ এবং ৳${cogs} COGS রিভার্স করা হয়েছে।`,
          timestamp: new Date().toLocaleString(),
        });
      }

      await activityLogRepository.create({
        id: `act-${Date.now()}`,
        userName: updatedBy,
        action: 'অর্ডার স্ট্যাটাস পরিবর্তন',
        details: `অর্ডার #${updated.orderNumber} স্ট্যাটাস ${prevStatus} থেকে ${status} করা হয়েছে।`,
        timestamp: new Date().toLocaleString(),
      });
    }

    return updated;
  }
}

export const orderService = new OrderService();
