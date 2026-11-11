import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { createServer as createNetServer } from 'node:net';
import { chromium } from '@playwright/test';
import { preview } from 'vite';
import { getPortraitAvailability } from './portrait-assets.mjs';

const root = resolve(import.meta.dirname, '..');
const outputDirectory = join(root, 'test-results', 'visual-review');
const locales = {
  en: 'Portrait of Miłosz Podsiadły',
  pl: 'Portret Miłosza Podsiadłego',
};
const viewports = [
  { width: 390, height: 844 },
  { width: 1440, height: 900 },
];

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

assert.equal(
  await getPortraitAvailability(join(root, 'public')),
  true,
  'Visual review requires both approved public WebP exports.',
);
assert.equal(
  await getPortraitAvailability(join(root, 'dist')),
  true,
  'Run the build with both portrait exports before visual capture.',
);

const port = await findFreePort();
const server = await preview({
  configFile: join(root, 'vite.config.ts'),
  root,
  preview: { host: '127.0.0.1', port, strictPort: true },
  logLevel: 'error',
});
let browser;

try {
  browser = await chromium.launch({ headless: true });
  await mkdir(outputDirectory, { recursive: true });
  const captures = [];

  for (const [locale, portraitAlt] of Object.entries(locales)) {
    for (const viewport of viewports) {
      const context = await browser.newContext({
        viewport,
        deviceScaleFactor: 1,
        colorScheme: 'dark',
        reducedMotion: 'reduce',
      });
      const page = await context.newPage();
      const runtimeErrors = [];
      page.on('pageerror', (error) => runtimeErrors.push(error.message));
      page.on('console', (message) => {
        if (message.type() === 'error') runtimeErrors.push(message.text());
      });

      const response = await page.goto(`http://127.0.0.1:${port}/${locale}/`, {
        waitUntil: 'load',
      });
      assert.equal(response?.status(), 200, `${locale} route did not return HTTP 200.`);
      assert.equal(await page.locator('html').getAttribute('lang'), locale);
      assert.equal(await page.locator('#root').getAttribute('data-portrait-available'), 'true');

      const portrait = page.getByRole('img', { name: portraitAlt });
      await portrait.waitFor({ state: 'visible' });
      await portrait.evaluate(async (image) => image.decode());
      const imageInfo = await portrait.evaluate((image) => ({
        naturalWidth: image.naturalWidth,
        currentSrc: image.currentSrc,
        bounds: image.getBoundingClientRect().toJSON(),
      }));
      assert.ok(imageInfo.naturalWidth > 0, `${locale} portrait failed to load.`);
      assert.match(imageInfo.currentSrc, /hero-(480|960)\.webp$/);
      await page.evaluate(() => globalThis.document.fonts.ready);
      await page.evaluate(
        () =>
          new Promise((resolveFrame) =>
            globalThis.requestAnimationFrame(() => globalThis.requestAnimationFrame(resolveFrame)),
          ),
      );

      const copyBounds = await page
        .locator('.hero-copy')
        .evaluate((element) => element.getBoundingClientRect().toJSON());
      const visualBounds = await page
        .locator('.hero-visual')
        .evaluate((element) => element.getBoundingClientRect().toJSON());
      const ctaBounds = await page
        .getByRole('link', { name: locale === 'en' ? 'View projects' : 'Zobacz projekty' })
        .evaluate((element) => element.getBoundingClientRect().toJSON());
      if (viewport.width <= 430) {
        assert.ok(
          ctaBounds.bottom <= visualBounds.top,
          `${locale} mobile CTA overlaps the portrait scene.`,
        );
      } else {
        const overlapsHorizontally = copyBounds.right > visualBounds.left;
        const overlapsVertically =
          copyBounds.bottom > visualBounds.top && copyBounds.top < visualBounds.bottom;
        assert.ok(
          !overlapsHorizontally || !overlapsVertically,
          `${locale} desktop copy overlaps the portrait scene.`,
        );
      }
      assert.deepEqual(runtimeErrors, [], `${locale} page logged a browser error.`);

      const filename = `${locale}-${viewport.width}x${viewport.height}.png`;
      await page.screenshot({
        path: join(outputDirectory, filename),
        fullPage: true,
        animations: 'disabled',
        caret: 'hide',
      });
      captures.push({ filename, locale, ...viewport, image: imageInfo });
      await context.close();
      console.log(`Captured ${join(outputDirectory, filename)}`);
    }
  }

  await writeFile(
    join(outputDirectory, 'manifest.json'),
    `${JSON.stringify(
      {
        chromiumVersion: browser.version(),
        platform: process.platform,
        architecture: process.arch,
        deviceScaleFactor: 1,
        colorScheme: 'dark',
        reducedMotion: 'reduce',
        captures,
      },
      null,
      2,
    )}\n`,
    'utf8',
  );
  console.log(`Visual review captures are in ${outputDirectory}.`);
} finally {
  await browser?.close();
  await new Promise((resolveClose, reject) => {
    server.httpServer.close((error) => (error ? reject(error) : resolveClose()));
    server.httpServer.closeAllConnections?.();
  });
}
