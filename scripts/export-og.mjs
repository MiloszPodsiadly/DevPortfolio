import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from '@playwright/test';

const root = resolve(import.meta.dirname, '..');
const width = 1200;
const height = 630;

function pngDimensions(image) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (!image.subarray(0, 8).equals(signature) || image.toString('ascii', 12, 16) !== 'IHDR') {
    throw new Error('The exported social image is not a PNG with an IHDR header.');
  }
  return { width: image.readUInt32BE(16), height: image.readUInt32BE(20) };
}

export async function exportOgImage({
  sourcePath = resolve(root, 'design/og/portfolio-cover.svg'),
  outputPath = resolve(root, 'public/assets/og/portfolio-cover.png'),
} = {}) {
  const svg = await readFile(sourcePath, 'utf8');
  if (!/<svg\b[^>]*\bwidth="1200"[^>]*\bheight="630"/i.test(svg)) {
    throw new Error('The OG SVG source must declare a 1200x630 canvas.');
  }
  if (/<script\b|<foreignObject\b|(?:href|xlink:href)\s*=\s*["'](?:https?:|data:)/i.test(svg)) {
    throw new Error(
      'The OG SVG source must not contain scripts, external content, or embedded data.',
    );
  }

  const browser = await chromium.launch({ headless: true });
  let image;
  try {
    const page = await browser.newPage({
      viewport: { width, height },
      deviceScaleFactor: 1,
      colorScheme: 'dark',
    });
    await page.setContent(
      `<!doctype html><html><head><meta charset="UTF-8"><style>html,body{margin:0;width:${width}px;height:${height}px;overflow:hidden}svg{display:block}</style></head><body>${svg}</body></html>`,
      { waitUntil: 'load' },
    );
    await page.evaluate(() => globalThis.document.fonts.ready);
    const bounds = await page.locator('svg').boundingBox();
    if (bounds?.width !== width || bounds.height !== height) {
      throw new Error(
        `The OG SVG rendered to ${bounds?.width}x${bounds?.height}, expected ${width}x${height}.`,
      );
    }
    image = await page.locator('svg').screenshot({ type: 'png', animations: 'disabled' });
  } finally {
    await browser.close();
  }

  const dimensions = pngDimensions(image);
  if (dimensions.width !== width || dimensions.height !== height) {
    throw new Error(
      `The exported PNG is ${dimensions.width}x${dimensions.height}, expected ${width}x${height}.`,
    );
  }
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, image);
  return { path: outputPath, ...dimensions, bytes: image.length };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const result = await exportOgImage();
    console.log(`${result.path}: ${result.width}x${result.height}, ${result.bytes} bytes`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
