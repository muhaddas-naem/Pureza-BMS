/**
 * Orders API Routes
 *
 * Pattern: Route -> Service -> Repository -> Database
 */

import { Router } from 'express';
import { orderService } from '../services/orderService';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const orders = await orderService.getOrders();
    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const created = await orderService.createOrder(req.body);
    res.json({ success: true, data: created });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/status', async (req, res, next) => {
  try {
    const { status, updatedBy, notes } = req.body;
    const updated = await orderService.updateOrderStatus(req.params.id, status, updatedBy, notes);
    if (!updated) return res.status(404).json({ error: 'Order not found' });
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
});

export default router;
