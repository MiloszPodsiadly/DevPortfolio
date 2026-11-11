import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { getPortraitAvailability } from './portrait-assets.mjs';

let publicDirectory;

afterEach(async () => {
  if (publicDirectory) await rm(publicDirectory, { recursive: true, force: true });
  publicDirectory = undefined;
});

async function createPublicDirectory() {
  publicDirectory = await mkdtemp(join(tmpdir(), 'portfolio-public-'));
  return publicDirectory;
}

describe('portrait asset availability', () => {
  it('returns false when neither responsive export exists', async () => {
    const directory = await createPublicDirectory();
    await expect(getPortraitAvailability(directory)).resolves.toBe(false);
  });

  it('returns true only when both responsive exports exist', async () => {
    const directory = await createPublicDirectory();
    const portraitsDirectory = join(directory, 'assets', 'portraits');
    await mkdir(portraitsDirectory, { recursive: true });
    await writeFile(join(portraitsDirectory, 'hero-480.webp'), 'small');
    await writeFile(join(portraitsDirectory, 'hero-960.webp'), 'large');

    await expect(getPortraitAvailability(directory)).resolves.toBe(true);
  });

  it('fails explicitly when only one responsive export exists', async () => {
    const directory = await createPublicDirectory();
    const portraitsDirectory = join(directory, 'assets', 'portraits');
    await mkdir(portraitsDirectory, { recursive: true });
    await writeFile(join(portraitsDirectory, 'hero-480.webp'), 'small');

    await expect(getPortraitAvailability(directory)).rejects.toThrow(
      'Portrait exports are incomplete; missing: hero-960.webp.',
    );
  });
});
