import { describe, expect, it } from 'vitest';
import { pageContent } from '../locales';
import { socialLinks, validateSocialLinks } from './socials';

describe('public social links', () => {
  it('contains only the owner-provided LinkedIn and confirmed GitHub profiles', () => {
    expect(socialLinks).toEqual([
      { id: 'github', href: 'https://github.com/MiloszPodsiadly' },
      { id: 'linkedin', href: 'https://www.linkedin.com/in/milosz-podsiadly/' },
    ]);
    expect(validateSocialLinks()).toEqual([]);
  });

  it('has translated accessible labels in both supported locales', () => {
    for (const locale of ['en', 'pl'] as const) {
      expect(pageContent[locale].socialLinkLabels.github.trim()).not.toBe('');
      expect(pageContent[locale].socialLinkLabels.linkedin.trim()).not.toBe('');
    }
  });
});
