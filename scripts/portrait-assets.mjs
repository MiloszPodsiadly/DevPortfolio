import { access } from 'node:fs/promises';
import { join } from 'node:path';

export const portraitExportNames = ['hero-480.webp', 'hero-960.webp'];

export async function getPortraitAvailability(publicDirectory) {
  if (!publicDirectory) return false;

  const portraitDirectory = join(publicDirectory, 'assets', 'portraits');
  const exists = await Promise.all(
    portraitExportNames.map(async (filename) => {
      try {
        await access(join(portraitDirectory, filename));
        return true;
      } catch (error) {
        if (error.code === 'ENOENT') return false;
        throw error;
      }
    }),
  );

  if (exists.some(Boolean) && !exists.every(Boolean)) {
    const missing = portraitExportNames.filter((_, index) => !exists[index]);
    throw new Error(`Portrait exports are incomplete; missing: ${missing.join(', ')}.`);
  }

  return exists.every(Boolean);
}
