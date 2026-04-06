import { spawn } from 'node:child_process';
import readline from 'node:readline';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const services = [
  { name: 'backend', cwd: path.join(rootDir, 'backend'), color: '\x1b[36m' },
  { name: 'frontend', cwd: path.join(rootDir, 'frontend'), color: '\x1b[35m' },
];

const reset = '\x1b[0m';
const children = [];
let isShuttingDown = false;

const forwardStream = (stream, writer, prefix) => {
  if (!stream) {
    return;
  }

  const rl = readline.createInterface({ input: stream });
  rl.on('line', (line) => {
    writer.write(`${prefix}${line}\n`);
  });
};

for (const service of services) {
  const command = process.platform === 'win32' ? 'cmd.exe' : 'npm';
  const args =
    process.platform === 'win32' ? ['/c', 'npm.cmd', 'run', 'dev'] : ['run', 'dev'];

  process.stdout.write(`${service.color}[${service.name}]${reset} starting...\n`);

  const child = spawn(command, args, {
    cwd: service.cwd,
    env: process.env,
    stdio: ['inherit', 'pipe', 'pipe'],
  });

  const prefix = `${service.color}[${service.name}]${reset} `;
  forwardStream(child.stdout, process.stdout, prefix);
  forwardStream(child.stderr, process.stderr, prefix);

  child.on('exit', (code) => {
    if (isShuttingDown) {
      return;
    }

    if (code && code !== 0) {
      process.stderr.write(`${prefix}exited with code ${code}\n`);
      shutdown(code);
      return;
    }

    process.stdout.write(`${prefix}stopped\n`);
  });

  children.push(child);
}

const shutdown = (exitCode = 0) => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  process.exitCode = exitCode;

  for (const child of children) {
    if (!child.killed) {
      child.kill('SIGINT');
    }
  }
};

process.on('SIGINT', () => {
  shutdown();
  setTimeout(() => process.exit(0), 200);
});

process.on('SIGTERM', () => {
  shutdown();
  setTimeout(() => process.exit(0), 200);
});
