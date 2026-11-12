import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from '@playwright/test';

const root = resolve(import.meta.dirname, '..');
const size = 32;

export async function exportFavicon({
  sourcePath = resolve(root, 'public/favicon.svg'),
  outputPath = resolve(root, 'public/favicon.png'),
} = {}) {
  const svg = await readFile(sourcePath, 'utf8');
  if (!/<svg\b[^>]*\bwidth="64"[^>]*\bheight="64"/i.test(svg)) {
    throw new Error('The favicon SVG must declare a 64x64 canvas.');
  }
  if (/<script\b|<foreignObject\b|(?:href|xlink:href)\s*=\s*["'](?:https?:|data:)/i.test(svg)) {
    throw new Error('The favicon SVG must not contain scripts or external content.');
  }

  const browser = await chromium.launch({ headless: true });
  let image;
  try {
    const page = await browser.newPage({
      viewport: { width: size, height: size },
      deviceScaleFactor: 1,
      colorScheme: 'dark',
    });
    await page.setContent(
      `<!doctype html><html><head><meta charset="UTF-8"><style>html,body{margin:0;width:${size}px;height:${size}px;overflow:hidden}svg{display:block;width:${size}px;height:${size}px}</style></head><body>${svg}</body></html>`,
      { waitUntil: 'load' },
    );
    const bounds = await page.locator('svg').boundingBox();
    if (bounds?.width !== size || bounds.height !== size) {
      throw new Error(
        `The favicon rendered to ${bounds?.width}x${bounds?.height}, expected 32x32.`,
      );
    }
    image = await page.locator('svg').screenshot({ type: 'png', animations: 'disabled' });
  } finally {
    await browser.close();
  }

  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (
    !image.subarray(0, 8).equals(signature) ||
    image.toString('ascii', 12, 16) !== 'IHDR' ||
    image.readUInt32BE(16) !== size ||
    image.readUInt32BE(20) !== size
  ) {
    throw new Error('The exported favicon PNG is not 32x32.');
  }
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, image);
  return { path: outputPath, width: size, height: size, bytes: image.length };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const result = await exportFavicon();
    console.log(`${result.path}: ${result.width}x${result.height}, ${result.bytes} bytes`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
