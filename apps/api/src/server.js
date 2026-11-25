import { PrismaClient } from '@prisma/client';
import { createApp } from './app.js';
import { config } from './config/index.js';

const prisma = new PrismaClient({
  datasources: {
    db: { url: config.databaseUrl }
  },
  log: config.env === 'development' ? ['query', 'info', 'warn', 'error'] : ['error']
});

const app = createApp(prisma);

const host = process.env.HOST || '0.0.0.0';
const server = app.listen(config.port, host, () => {
  console.log(`[Bakka Farm API] Server listening on http://${host}:${config.port} (${config.env})`);
  console.log(`[Bakka Farm API] Health check at http://${host}:${config.port}/health and /api/health`);
});

// Graceful shutdown
async function gracefulShutdown(signal) {
  console.log(`[Bakka Farm API] Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    await prisma.$disconnect();
    console.log('[Bakka Farm API] Database connection closed.');
    process.exit(0);
  });
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
