import { Router } from 'express';
import aiRoutes from './ai.routes';
import invoiceRoutes from './invoice.routes';
import dbRoutes from './db.routes';
import productsRoutes from './products.routes';
import ordersRoutes from './orders.routes';
import authRoutes from '../server/auth/auth.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/ai', aiRoutes);
router.use('/invoice', invoiceRoutes);
router.use('/db', dbRoutes);
router.use('/products', productsRoutes);
router.use('/orders', ordersRoutes);

export default router;
