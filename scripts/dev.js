import { spawn, execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { freePorts } from './free_ports.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('\x1b[32m%s\x1b[0m', '🌱 Starting Bakka Farm Management System (Dev Mode)...');
console.log('\x1b[36m%s\x1b[0m', '  • API:  http://localhost:4000/api');
console.log('\x1b[32m%s\x1b[0m', '  • Web:  http://localhost:3000\n');

// 1. Pre-flight check: Automatically free ports 3000 & 4000
freePorts([3000, 4000]);

const nextBin = path.join(rootDir, 'node_modules', 'next', 'dist', 'bin', 'next');

// 2. Spawn Backend API directly with Node (no shell warning, clean PID)
const apiProcess = spawn(process.execPath, ['--watch', 'src/server.js'], {
  cwd: path.join(rootDir, 'apps', 'api'),
  stdio: 'pipe'
});

apiProcess.stdout.on('data', (data) => {
  process.stdout.write(`\x1b[36m[api]\x1b[0m ${data}`);
});

apiProcess.stderr.on('data', (data) => {
  process.stderr.write(`\x1b[31m[api error]\x1b[0m ${data}`);
});

// 3. Spawn Frontend Web directly with Node
const webProcess = spawn(process.execPath, [nextBin, 'dev', '-p', '3000'], {
  cwd: path.join(rootDir, 'apps', 'web'),
  stdio: 'pipe'
});

webProcess.stdout.on('data', (data) => {
  process.stdout.write(`\x1b[32m[web]\x1b[0m ${data}`);
});

webProcess.stderr.on('data', (data) => {
  process.stderr.write(`\x1b[33m[web log]\x1b[0m ${data}`);
});

// 4. Clean shutdown: ensure both process trees terminate completely
let cleanedUp = false;
function cleanup() {
  if (cleanedUp) return;
  cleanedUp = true;
  console.log('\n\x1b[33m%s\x1b[0m', 'Shutting down Bakka Farm development servers...');

  const isWin = process.platform === 'win32';
  if (isWin) {
    if (apiProcess?.pid) {
      try { execSync(`taskkill /F /T /PID ${apiProcess.pid}`, { stdio: 'ignore' }); } catch (e) {}
    }
    if (webProcess?.pid) {
      try { execSync(`taskkill /F /T /PID ${webProcess.pid}`, { stdio: 'ignore' }); } catch (e) {}
    }
  } else {
    try { apiProcess.kill('SIGTERM'); } catch (e) {}
    try { webProcess.kill('SIGTERM'); } catch (e) {}
  }

  // Also ensure ports are freed
  freePorts([3000, 4000]);
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
