/**
 * Authentication Express Routes
 *
 * Base Route: /api/auth
 */

import { Router } from 'express';
import { authController } from './auth.controller';
import { authenticate, rateLimiter } from './auth.middleware';

const router = Router();

// Public Authentication Endpoints
router.post('/login', rateLimiter(10, 60 * 1000), (req, res, next) => authController.login(req, res, next));
router.post('/refresh-token', (req, res, next) => authController.refreshToken(req, res, next));
router.post('/forgot-password', rateLimiter(5, 60 * 1000), (req, res, next) => authController.forgotPassword(req, res, next));
router.post('/reset-password', (req, res, next) => authController.resetPassword(req, res, next));

// Protected User Account Endpoints
router.use(authenticate);

router.post('/logout', (req, res, next) => authController.logout(req, res, next));
router.get('/me', (req, res, next) => authController.getProfile(req, res, next));
router.patch('/me', (req, res, next) => authController.updateProfile(req, res, next));
router.post('/change-password', (req, res, next) => authController.changePassword(req, res, next));

export default router;
