import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from '@playwright/test';

const root = resolve(import.meta.dirname, '..');
const sourcePath = resolve(root, 'assets-source/portraits/hero-source.png');
const outputDirectory = resolve(root, 'public/assets/portraits');
const widths = [480, 960];
const quality = 0.86;

const source = await readFile(sourcePath).catch((error) => {
  if (error.code === 'ENOENT') {
    throw new Error(
      `Portrait source not found at ${sourcePath}. Keep the approved original there before exporting.`,
    );
  }
  throw error;
});
const sourceUrl = `data:image/png;base64,${source.toString('base64')}`;
const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage();
  const variants = await page.evaluate(
    async ({ imageUrl, targetWidths, imageQuality }) => {
      const image = new globalThis.Image();
      image.src = imageUrl;
      await image.decode();

      return targetWidths.map((width) => {
        const height = Math.round((image.naturalHeight * width) / image.naturalWidth);
        const canvas = globalThis.document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Canvas 2D context is not available.');
        context.drawImage(image, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/webp', imageQuality);
        if (!dataUrl.startsWith('data:image/webp;')) {
          throw new Error('This Chromium build cannot encode WebP images.');
        }
        return { width, height, dataUrl };
      });
    },
    { imageUrl: sourceUrl, targetWidths: widths, imageQuality: quality },
  );

  await mkdir(outputDirectory, { recursive: true });
  for (const variant of variants) {
    const base64 = variant.dataUrl.slice(variant.dataUrl.indexOf(',') + 1);
    const output = Buffer.from(base64, 'base64');
    if (output.toString('ascii', 0, 4) !== 'RIFF' || output.toString('ascii', 8, 12) !== 'WEBP') {
      throw new Error(`Generated image ${variant.width} is not a valid WebP file.`);
    }

    let offset = 12;
    while (offset + 8 <= output.length) {
      const chunkName = output.toString('ascii', offset, offset + 4);
      const chunkLength = output.readUInt32LE(offset + 4);
      if (chunkName === 'EXIF' || chunkName === 'XMP ') {
        throw new Error(`Generated WebP contains unexpected ${chunkName.trim()} metadata.`);
      }
      offset += 8 + chunkLength + (chunkLength % 2);
    }

    const filename = `hero-${variant.width}.webp`;
    await writeFile(resolve(outputDirectory, filename), output);
    console.log(`${filename}: ${variant.width}x${variant.height}, ${output.length} bytes`);
  }
} finally {
  await browser.close();
}
