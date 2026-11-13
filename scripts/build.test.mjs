import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { access, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { verifyOutput } from './verify-output.mjs';

const execFileAsync = promisify(execFile);
let temporaryRoot;

afterEach(async () => {
  if (temporaryRoot) await rm(temporaryRoot, { recursive: true, force: true });
  temporaryRoot = undefined;
});

describe('isolated static build modes', () => {
  it('builds and verifies unconfigured and configured SEO without touching dist/', async () => {
    temporaryRoot = await mkdtemp(join(tmpdir(), 'portfolio-build-modes-'));
    const configuredOrigin = 'https://portfolio.dev';

    for (const mode of [
      { name: 'unconfigured', siteUrl: '' },
      { name: 'configured', siteUrl: configuredOrigin },
    ]) {
      const distDirectory = join(temporaryRoot, mode.name);
      await execFileAsync(process.execPath, ['scripts/build.mjs'], {
        cwd: process.cwd(),
        env: {
          ...process.env,
          SITE_URL: mode.siteUrl,
          PORTFOLIO_DIST_DIR: distDirectory,
        },
        timeout: 120_000,
      });
      const result = await verifyOutput({ distDirectory, siteUrl: mode.siteUrl });
      expect(result.siteOrigin).toBe(mode.name === 'configured' ? configuredOrigin : undefined);
    }
  }, 180_000);

  it('rejects invalid SITE_URL before creating partial output', async () => {
    temporaryRoot = await mkdtemp(join(tmpdir(), 'portfolio-invalid-build-'));
    const distDirectory = join(temporaryRoot, 'invalid');

    await expect(
      execFileAsync(process.execPath, ['scripts/build.mjs'], {
        cwd: process.cwd(),
        env: {
          ...process.env,
          SITE_URL: 'http://portfolio.dev',
          PORTFOLIO_DIST_DIR: distDirectory,
        },
        timeout: 30_000,
      }),
    ).rejects.toMatchObject({
      stderr: expect.stringContaining('SITE_URL must be an absolute HTTPS origin'),
    });
    await expect(access(distDirectory)).rejects.toThrow();
  }, 60_000);
});
