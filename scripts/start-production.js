import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const port = process.env.PORT || '3000';
const apiPort = '4000';

console.log('[Bakka Farm Production] Starting system...');
console.log(`[Bakka Farm Production] Public Frontend Port: ${port}`);
console.log(`[Bakka Farm Production] Internal API Port: ${apiPort}`);

// 1. Start Backend API on internal port 4000
const apiEnv = {
  ...process.env,
  PORT: apiPort,
  HOST: '0.0.0.0',
  NODE_ENV: 'production'
};

const apiProcess = spawn('node', ['apps/api/src/server.js'], {
  cwd: rootDir,
  env: apiEnv,
  stdio: 'inherit'
});

apiProcess.on('error', (err) => {
  console.error('[Bakka Farm Production] API spawn error:', err);
});

// 2. Start Next.js Frontend on the public PORT
const nextBin = path.join(rootDir, 'node_modules', 'next', 'dist', 'bin', 'next');

const webEnv = {
  ...process.env,
  PORT: port,
  NODE_ENV: 'production'
};

const webProcess = spawn('node', [nextBin, 'start', 'apps/web', '-p', port, '-H', '0.0.0.0'], {
  cwd: rootDir,
  env: webEnv,
  stdio: 'inherit'
});

webProcess.on('error', (err) => {
  console.error('[Bakka Farm Production] Web spawn error:', err);
});

// Graceful shutdown handling
function shutdown(signal) {
  console.log(`[Bakka Farm Production] Received ${signal}. Shutting down services gracefully...`);
  try { apiProcess.kill(signal); } catch {}
  try { webProcess.kill(signal); } catch {}
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

apiProcess.on('exit', (code, signal) => {
  if (code !== 0) {
    console.error(`[Bakka Farm Production] API process exited unexpectedly with code ${code} (signal ${signal})`);
  }
});

webProcess.on('exit', (code, signal) => {
  console.log(`[Bakka Farm Production] Web process exited with code ${code} (signal ${signal})`);
  try { apiProcess.kill('SIGTERM'); } catch {}
  process.exit(code || 0);
});
