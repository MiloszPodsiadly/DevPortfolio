import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const styles = readFileSync('src/styles/globals.css', 'utf8');
const notFound = readFileSync('public/404.html', 'utf8');
const buildScript = readFileSync('scripts/build.mjs', 'utf8');

const themeTokens = [
  ['--color-night-950', '#070d20'],
  ['--color-night-900', '#0b1533'],
  ['--color-surface-800', '#101b3d'],
  ['--color-surface-700', '#17234b'],
  ['--color-electric-blue', '#4e8cff'],
  ['--color-ice-blue', '#70b7ff'],
  ['--color-nebula-violet', '#9568f9'],
  ['--color-lavender', '#b8a4ff'],
  ['--color-pink-glow', '#ff5ba7'],
  ['--color-text-primary', '#f4f7ff'],
  ['--color-text-muted', '#becbe8'],
  ['--color-border-night', 'rgba(142, 164, 255, 0.28)'],
];

function luminance(hex) {
  const channels = [1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16) / 255);
  const [red, green, blue] = channels.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrastRatio(foreground, background) {
  const values = [luminance(foreground), luminance(background)].sort(
    (first, second) => second - first,
  );
  return (values[0] + 0.05) / (values[1] + 0.05);
}

describe('Blue/Violet Nightfall theme contract', () => {
  it('centralizes the approved palette in Tailwind 4 theme variables', () => {
    expect(styles).toMatch(/@theme\s*\{/);
    for (const [name, value] of themeTokens) {
      expect(styles).toContain(`${name}: ${value};`);
    }
  });

  it('keeps the former pink-first palette out of active page and build styles', () => {
    const activeSources = `${styles}\n${notFound}\n${buildScript}`.toLowerCase();
    for (const oldColor of [
      '#0b0613',
      '#180d27',
      '#ff2d96',
      '#a855f7',
      '#fbcfe8',
      '#faf7ff',
      '#c7bbd5',
    ]) {
      expect(activeSources).not.toContain(oldColor);
    }
  });

  it('uses AA contrast for body text, button text and the visible focus ring', () => {
    expect(contrastRatio('#F4F7FF', '#070D20')).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio('#BECBE8', '#070D20')).toBeGreaterThanOrEqual(4.5);
    for (const buttonStop of ['#4E8CFF', '#9568F9']) {
      expect(contrastRatio('#070D20', buttonStop)).toBeGreaterThanOrEqual(4.5);
    }
    expect(contrastRatio('#70B7FF', '#070D20')).toBeGreaterThanOrEqual(3);
    expect(styles).toContain('outline: 3px solid var(--color-ice-blue);');
  });
});
