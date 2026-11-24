import { PrismaClient } from '@prisma/client';
import { createApp } from './app.js';
import { config } from './config/index.js';

const prisma = new PrismaClient({
  log: config.env === 'development' ? ['query', 'info', 'warn', 'error'] : ['error']
});

const app = createApp(prisma);

const server = app.listen(config.port, '0.0.0.0', () => {
  console.log(`[Bakka Farm API] Server listening on port ${config.port} (${config.env})`);
  console.log(`[Bakka Farm API] Health check at http://0.0.0.0:${config.port}/health and /api/health`);
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
