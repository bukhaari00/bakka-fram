import { execSync } from 'child_process';

export function freePorts(ports = [3000, 4000]) {
  if (process.platform !== 'win32') {
    for (const port of ports) {
      try {
        execSync(`lsof -ti :${port} | xargs kill -9`, { stdio: 'ignore' });
      } catch (e) {}
    }
    return;
  }

  try {
    const netstatOutput = execSync('netstat -ano', { encoding: 'utf-8' });
    const lines = netstatOutput.split('\n');
    const pidsToKill = new Set();

    for (const line of lines) {
      for (const port of ports) {
        // Look for lines like: TCP 0.0.0.0:3000 ... LISTENING 1234
        // or [::]:3000 ... LISTENING 1234
        if (line.includes(`:${port}`) && line.includes('LISTENING')) {
          const parts = line.trim().split(/\s+/);
          const pid = parts[parts.length - 1];
          if (pid && pid !== '0' && pid !== `${process.pid}`) {
            pidsToKill.add(pid);
          }
        }
      }
    }

    for (const pid of pidsToKill) {
      console.log(`[cleanup] Terminating lingering process on port (PID: ${pid})...`);
      try {
        execSync(`taskkill /F /T /PID ${pid}`, { stdio: 'ignore' });
      } catch (e) {}
    }
  } catch (err) {
    // netstat or taskkill failed silently
  }
}

if (process.argv[1]?.endsWith('free_ports.js')) {
  freePorts([3000, 4000]);
  console.log('[cleanup] Ports 3000 and 4000 checked and freed.');
}
