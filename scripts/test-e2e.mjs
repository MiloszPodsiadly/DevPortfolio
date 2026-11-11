import { spawn } from 'node:child_process';
import { join, resolve } from 'node:path';
import { preview } from 'vite';

const root = resolve(import.meta.dirname, '..');
const server = await preview({
  root,
  preview: { host: '127.0.0.1', port: 0, strictPort: true },
});

async function closePreview() {
  await new Promise((resolveClose, rejectClose) => {
    server.httpServer.close((error) => {
      if (error) rejectClose(error);
      else resolveClose();
    });
    server.httpServer.closeAllConnections?.();
  });
}

let exitCode;
try {
  const address = server.httpServer.address();
  if (!address || typeof address === 'string') {
    throw new Error('Vite preview did not expose a local TCP port.');
  }

  const browserTests = spawn(
    process.execPath,
    [join(root, 'node_modules', 'playwright', 'cli.js'), 'test', ...process.argv.slice(2)],
    {
      cwd: root,
      env: { ...process.env, E2E_BASE_URL: `http://127.0.0.1:${address.port}` },
      stdio: 'inherit',
    },
  );

  exitCode = await new Promise((resolveExit, rejectExit) => {
    browserTests.once('error', rejectExit);
    browserTests.once('exit', (code) => resolveExit(code ?? 1));
  });
} finally {
  await closePreview();
}

process.exitCode = exitCode;
