import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import { errorHandler } from './middleware/errorHandler.js';
import { successResponse } from './utils/response.js';
import { config } from './config/index.js';

import { createAuthRouter } from './modules/auth/auth.routes.js';
import { createUsersRouter } from './modules/users/users.routes.js';
import { createSyncRouter } from './modules/sync/sync.routes.js';
import { createFarmRouter } from './modules/farm/farm.routes.js';
import { createTasksRouter } from './modules/tasks/tasks.routes.js';
import { createInventoryRouter } from './modules/inventory/inventory.routes.js';
import { createHarvestRouter } from './modules/harvest/harvest.routes.js';
import { createFinanceRouter } from './modules/finance/finance.routes.js';
import { createReportsRouter } from './modules/reports/reports.routes.js';

export function createApp(prisma) {
  const app = express();

  // Basic security and parsing middleware
  app.use(helmet());
  app.use(cors({
    origin: config.appOrigin,
    credentials: true
  }));
  app.use(cookieParser());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Rate limiter for authentication endpoints
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: { message: 'Too many login attempts, please try again later.' }
    }
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    return successResponse(res, {
      status: 'healthy',
      system: 'Bakka Farm Management API',
      timestamp: new Date().toISOString(),
      offlineReady: true
    });
  });

  // Core API modules
  app.use('/api/auth', authLimiter, createAuthRouter(prisma));
  app.use('/api/users', createUsersRouter(prisma));
  app.use('/api/sync', createSyncRouter(prisma));
  app.use('/api/farm', createFarmRouter(prisma));
  app.use('/api/tasks', createTasksRouter(prisma));
  app.use('/api/inventory', createInventoryRouter(prisma));
  app.use('/api/harvest', createHarvestRouter(prisma));
  app.use('/api/finance', createFinanceRouter(prisma));
  app.use('/api/reports', createReportsRouter(prisma));

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
}
