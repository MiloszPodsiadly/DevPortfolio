import { describe, expect, it } from 'vitest';
import { getPageContent, isLocale, localeFromPath, pageContent, routeForLocale } from './index';
import { validateExternalUrl, validateLocaleContent, validateProject } from '../content/profile';
import type { Project } from '../content/profile';

describe('locale contract', () => {
  it('accepts only the supported locales and maps paths deterministically', () => {
    expect(isLocale('en')).toBe(true);
    expect(isLocale('pl')).toBe(true);
    expect(isLocale('de')).toBe(false);
    expect(localeFromPath('/pl/projects/')).toBe('pl');
    expect(localeFromPath('/en/')).toBe('en');
    expect(localeFromPath('/')).toBe('en');
    expect(routeForLocale('pl')).toBe('/pl/');
  });

  it('keeps the minimal translated content complete and the role exact', () => {
    expect(validateLocaleContent(pageContent)).toEqual([]);
    expect(getPageContent('en').role).toBe('Junior Software Developer');
    expect(getPageContent('pl').role).toBe('Junior Software Developer');
    expect(
      validateLocaleContent({ en: pageContent.en, pl: { ...pageContent.pl, introduction: ' ' } }),
    ).toContain('Missing introduction for locale: pl');
    expect(validateLocaleContent({ ...pageContent, de: pageContent.en })).toContain(
      'Unsupported locale: de',
    );
  });
});

describe('future content links', () => {
  it('rejects missing, non-HTTP and obvious placeholder URLs', () => {
    expect(validateExternalUrl('https://github.com/verified-project')).toBe(true);
    expect(validateExternalUrl('javascript:alert(1)')).toBe(false);
    expect(validateExternalUrl('https://example.com')).toBe(false);
    expect(validateExternalUrl('https://portfolio.example.dev')).toBe(false);
    expect(validateExternalUrl('http://localhost')).toBe(false);
    expect(validateExternalUrl('not a URL')).toBe(false);
  });

  it('validates future project content without publishing project cards now', () => {
    const project: Project = {
      slug: 'sample-project',
      name: 'Sample Project',
      summary: 'A short project summary.',
      problem: 'A clearly stated problem.',
      solution: 'A concise solution description.',
      role: 'Contributor',
      technologies: ['TypeScript'],
      repositoryUrl: 'https://github.com/owner/repository',
      asset: '/assets/project-preview.webp',
      publicationStatus: 'draft',
    };
    expect(validateProject(project)).toEqual([]);
    expect(validateProject({ ...project, demoUrl: 'https://placeholder.example' })).toContain(
      'Project demo URL is invalid.',
    );
  });
});
