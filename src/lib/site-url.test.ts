import { describe, expect, it } from 'vitest';
import { validateSiteOrigin } from './site-url.mjs';

describe('optional site origin', () => {
  it('omits canonical origin until a confirmed domain is supplied', () => {
    expect(validateSiteOrigin(undefined)).toBeUndefined();
    expect(validateSiteOrigin('')).toBeUndefined();
    expect(validateSiteOrigin('https://portfolio.dev')).toBe('https://portfolio.dev');
  });

  it.each([
    'http://portfolio.dev',
    'https://portfolio.dev/path',
    'https://example.com',
    'https://portfolio.example.dev',
    'not a URL',
  ])('rejects unconfirmed or invalid origins: %s', (value) => {
    expect(() => validateSiteOrigin(value)).toThrow();
  });
});
