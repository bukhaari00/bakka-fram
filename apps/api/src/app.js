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
import { renderPortalHtml } from './modules/portal/portal.html.js';

export function createApp(prisma) {
  const app = express();

  // Basic security and parsing middleware
  app.use(helmet());
  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, internal service-to-service, or same-origin)
      if (!origin) return callback(null, true);
      if (
        origin === config.appOrigin ||
        origin === 'http://localhost:3000' ||
        origin.endsWith('.vercel.app') ||
        process.env.NODE_ENV !== 'production'
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
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

  // Health check endpoint (compatible with Railway, Vercel, Docker & orchestrators)
  app.get(['/health', '/api/health'], async (req, res) => {
    let dbStatus = 'connected';
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (e) {
      dbStatus = 'disconnected';
    }
    return res.status(200).json({
      success: true,
      data: {
        status: dbStatus === 'connected' ? 'healthy' : 'degraded',
        database: dbStatus,
        system: 'Bakka Farm Management API',
        environment: config.env,
        timestamp: new Date().toISOString()
      }
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

  // Web Portal UI (Instant Login & Signup web interface on /)
  app.get(['/', '/login', '/signup', '/portal'], renderPortalHtml);

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
}
