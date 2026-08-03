/**
 * Products API Routes
 *
 * Pattern: Route -> Service -> Repository -> Database
 */

import { Router } from 'express';
import { productService } from '../services/productService';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const products = await productService.getProducts();
    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const created = await productService.createProduct(req.body);
    res.json({ success: true, data: created });
  } catch (error) {
    next(error);
  }
});

export default router;
