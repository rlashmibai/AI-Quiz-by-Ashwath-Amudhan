import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const rawArgs = process.argv.slice(2);
let port = process.env.PORT || '3000';
let hostname = '0.0.0.0';

for (let i = 0; i < rawArgs.length; i += 1) {
  const arg = rawArgs[i];
  if (arg === '--port' || arg === '-p') {
    if (rawArgs[i + 1] && !rawArgs[i + 1].startsWith('-')) {
      port = rawArgs[i + 1];
      i += 1;
    }
  } else if (arg.startsWith('--port=')) {
    port = arg.split('=')[1] || port;
  } else if (arg === '--hostname' || arg === '-H') {
    if (rawArgs[i + 1] && !rawArgs[i + 1].startsWith('-')) {
      hostname = rawArgs[i + 1];
      i += 1;
    }
  } else if (arg.startsWith('--hostname=')) {
    hostname = arg.split('=')[1] || hostname;
  } else if (arg === '--host') {
    // Ignore bare `--host` (Vite flag passed by preview runner), or consume value if provided
    if (rawArgs[i + 1] && !rawArgs[i + 1].startsWith('-')) {
      hostname = rawArgs[i + 1];
      i += 1;
    }
  } else if (arg.startsWith('--host=')) {
    hostname = arg.split('=')[1] || hostname;
  }
}

const nextBin = path.resolve(process.cwd(), 'node_modules', '.bin', 'next');
const disableHmr = process.env.DISABLE_HMR === 'true';

if (disableHmr) {
  const buildIdPath = path.resolve(process.cwd(), '.next', 'BUILD_ID');
  if (!fs.existsSync(buildIdPath)) {
    const buildResult = spawnSync(nextBin, ['build'], { stdio: 'inherit' });
    if (buildResult.status !== 0) {
      process.exit(buildResult.status ?? 1);
    }
  }
}

const nextArgs = disableHmr
  ? ['start', '--port', port, '--hostname', hostname]
  : ['dev', '--port', port, '--hostname', hostname];

const child = spawn(nextBin, nextArgs, { stdio: 'inherit' });

const forwardSignal = (signal) => {
  if (!child.killed) {
    child.kill(signal);
  }
};

process.on('SIGINT', () => forwardSignal('SIGINT'));
process.on('SIGTERM', () => forwardSignal('SIGTERM'));

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
