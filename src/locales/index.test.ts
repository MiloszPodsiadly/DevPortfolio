import { describe, expect, it } from 'vitest';
import { getPageContent, isLocale, localeFromPath, pageContent, routeForLocale } from './index';
import { projects } from '../content/projects';
import {
  validateExternalUrl,
  validateLocaleContent,
  validateProject,
  validateProjectManifest,
} from '../content/profile';
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
    expect(getPageContent('en').aboutDescription).toMatch(/event-driven/);
    expect(getPageContent('pl').afterHoursItems.map((item) => item.id)).toEqual([
      'games',
      'science-fantasy',
      'technology',
    ]);
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

  it('validates four published projects with matching English and Polish slugs', () => {
    expect(projects.map((project) => project.slug)).toEqual([
      'fraud-detection-platform',
      'stockrescue-ai',
      'chess-project',
      'library',
    ]);
    expect(validateProjectManifest(projects)).toEqual([]);
  });

  it('rejects a duplicate slug and a missing project translation', () => {
    expect(validateProjectManifest([projects[0], projects[0], projects[2], projects[3]])).toContain(
      'Project slugs must be unique.',
    );
    const missingPolish = {
      ...projects[0],
      content: { en: projects[0].content.en },
    } as unknown as Project;
    expect(validateProject(missingPolish)).toContain(
      'Missing project translation pl: fraud-detection-platform',
    );
  });

  it('rejects excluded project copy', () => {
    const excludedCopy = {
      ...projects[0],
      content: {
        ...projects[0].content,
        en: { ...projects[0].content.en, summary: 'HopOn Netherlands works with food delivery.' },
      },
    };
    expect(validateProject(excludedCopy)).toContain(
      'Excluded project name found in en: fraud-detection-platform',
    );
  });
});
