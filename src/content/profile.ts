import { pageContent, type Locale } from '../locales';

export interface SiteProfile {
  name: string;
  role: 'Junior Software Developer';
  introduction: string;
}

export interface Project {
  slug: string;
  name: string;
  summary: string;
  problem: string;
  solution: string;
  role: string;
  technologies: string[];
  repositoryUrl: string;
  demoUrl?: string;
  asset: string;
  publicationStatus: 'draft' | 'published';
}

export function getProfile(locale: Locale): SiteProfile {
  const content = pageContent[locale];
  return {
    name: content.name,
    role: content.role,
    introduction: content.introduction,
  };
}

export function validateLocaleContent(content: Record<string, unknown>): string[] {
  const errors: string[] = [];
  for (const locale of Object.keys(content)) {
    if (locale !== 'en' && locale !== 'pl') errors.push(`Unsupported locale: ${locale}`);
  }
  for (const locale of ['en', 'pl']) {
    const value = content[locale];
    if (!value || typeof value !== 'object') {
      errors.push(`Missing locale content: ${locale}`);
      continue;
    }

    const page = value as Record<string, unknown>;
    for (const key of ['title', 'description', 'name', 'role', 'introduction']) {
      if (typeof page[key] !== 'string' || page[key].trim().length === 0) {
        errors.push(`Missing ${key} for locale: ${locale}`);
      }
    }
    if (page.role !== 'Junior Software Developer') {
      errors.push(`Unexpected role for locale: ${locale}`);
    }
  }
  return errors;
}

export function validateExternalUrl(value: string): boolean {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username !== '' || url.password !== '') return false;
    return !/(^|\.)(example|test|invalid|localhost|local)(\.|$)|your[-.]?domain|placeholder/i.test(
      url.hostname,
    );
  } catch {
    return false;
  }
}

export function validateProject(project: Project): string[] {
  const errors: string[] = [];
  for (const field of [
    'slug',
    'name',
    'summary',
    'problem',
    'solution',
    'role',
    'asset',
  ] as const) {
    if (project[field].trim() === '') errors.push(`Missing project field: ${field}`);
  }
  if (
    project.technologies.length === 0 ||
    project.technologies.some((technology) => technology.trim() === '')
  ) {
    errors.push('Project technologies must contain non-empty values.');
  }
  if (!validateExternalUrl(project.repositoryUrl))
    errors.push('Project repository URL is invalid.');
  if (project.demoUrl && !validateExternalUrl(project.demoUrl)) {
    errors.push('Project demo URL is invalid.');
  }
  return errors;
}
