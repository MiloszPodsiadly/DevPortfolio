import assert from 'node:assert/strict';
import { cp, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createServer as createNetServer } from 'node:net';
import { chromium } from '@playwright/test';
import { createServer, preview } from 'vite';
import { getPortraitAvailability } from './portrait-assets.mjs';

const root = resolve(import.meta.dirname, '..');
const locales = {
  en: 'Portrait of Miłosz Podsiadły',
  pl: 'Portret Miłosza Podsiadłego',
};

async function findFreePort() {
  const listener = createNetServer();
  await new Promise((resolveListen, reject) => {
    listener.once('error', reject);
    listener.listen(0, '127.0.0.1', resolveListen);
  });
  const address = listener.address();
  if (!address || typeof address === 'string') throw new Error('Could not reserve a local port.');
  await new Promise((resolveClose, reject) => {
    listener.close((error) => (error ? reject(error) : resolveClose()));
  });
  return address.port;
}

async function startDevServer(publicDirectory) {
  const port = await findFreePort();
  const options = {
    configFile: join(root, 'vite.config.ts'),
    root,
    server: { host: '127.0.0.1', port, strictPort: true },
    logLevel: 'error',
  };
  if (publicDirectory) options.publicDir = publicDirectory;

  const server = await createServer(options);
  await server.listen();
  return { baseURL: `http://127.0.0.1:${port}`, close: () => server.close() };
}

async function startPreviewServer() {
  const port = await findFreePort();
  const server = await preview({
    configFile: join(root, 'vite.config.ts'),
    root,
    preview: { host: '127.0.0.1', port, strictPort: true },
    logLevel: 'error',
  });
  return {
    baseURL: `http://127.0.0.1:${port}`,
    close: () =>
      new Promise((resolveClose, reject) => {
        server.httpServer.close((error) => (error ? reject(error) : resolveClose()));
        server.httpServer.closeAllConnections?.();
      }),
  };
}

async function assertLocalePage(browser, baseURL, locale, portraitAvailable) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const runtimeErrors = [];
  const failedAssetResponses = [];
  page.on('pageerror', (error) => runtimeErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(message.text());
  });
  page.on('response', (response) => {
    if (response.url().includes('/assets/portraits/') && response.status() >= 400) {
      failedAssetResponses.push(`${response.status()} ${response.url()}`);
    }
  });

  const response = await page.goto(`${baseURL}/${locale}/`, { waitUntil: 'load' });
  assert.equal(response?.status(), 200, `${locale} route did not return HTTP 200.`);
  assert.equal(await page.locator('html').getAttribute('lang'), locale);
  assert.equal(
    await page.locator('#root').getAttribute('data-portrait-available'),
    String(portraitAvailable),
  );
  const portrait = page.locator('img.hero-portrait');
  if (portraitAvailable) {
    await portrait.waitFor({ state: 'visible' });
    assert.equal(await portrait.getAttribute('alt'), locales[locale]);
    const imageWidth = await portrait.evaluate((image) => image.naturalWidth);
    assert.ok(imageWidth > 0, `${locale} portrait did not finish loading.`);
    assert.match(await portrait.evaluate((image) => image.currentSrc), /hero-(480|960)\.webp$/);
    assert.equal(await page.locator('.hero-scene').count(), 0);
  } else {
    assert.equal(await portrait.count(), 0, `${locale} should render the decorative fallback.`);
    assert.equal(await page.locator('.hero-scene').getAttribute('aria-hidden'), 'true');
  }

  assert.deepEqual(failedAssetResponses, []);
  assert.deepEqual(runtimeErrors, []);
  await page.close();
}

const servers = [];
let browser;
let temporaryPublicRoot;

try {
  assert.equal(await getPortraitAvailability(join(root, 'public')), true);
  assert.equal(await getPortraitAvailability(join(root, 'dist')), true);

  browser = await chromium.launch({ headless: true });
  const development = await startDevServer();
  servers.push(development);
  const productionPreview = await startPreviewServer();
  servers.push(productionPreview);

  for (const locale of Object.keys(locales)) {
    await assertLocalePage(browser, development.baseURL, locale, true);
    await assertLocalePage(browser, productionPreview.baseURL, locale, true);
  }

  temporaryPublicRoot = await mkdtemp(join(tmpdir(), 'portfolio-without-portrait-'));
  await cp(join(root, 'public'), temporaryPublicRoot, {
    recursive: true,
    filter: (source) => source !== join(root, 'public', 'assets', 'portraits'),
  });
  const fallbackDev = await startDevServer(temporaryPublicRoot);
  servers.push(fallbackDev);
  for (const locale of Object.keys(locales)) {
    await assertLocalePage(browser, fallbackDev.baseURL, locale, false);
  }

  console.log('Portrait parity passed in Vite dev and preview for /en/ and /pl/.');
  console.log(
    'The Vite dev fallback passed without portrait exports; other assets remain available.',
  );
} finally {
  await browser?.close();
  for (const server of servers.reverse()) await server.close();
  if (temporaryPublicRoot) await rm(temporaryPublicRoot, { recursive: true, force: true });
}
