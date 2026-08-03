import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import apiRoutes from '../routes';
import { errorHandler } from '../middleware/error.middleware';
import { dbManager } from './database/database';
import { securityHeaders } from './auth/auth.middleware';

export async function createApp() {
  const app = express();

  // Initialize Database Schema & Seed Data
  await dbManager.initialize();

  // Security Headers Middleware (Helmet compatible)
  app.use(securityHeaders);

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // API Routes
  app.use('/api', apiRoutes);

  // Serve Frontend / Vite Middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Global Error Handler Middleware
  app.use(errorHandler);

  return app;
}
