import { locales, type Locale } from '../locales';

export interface LocalizedProjectContent {
  name: string;
  summary: string;
}

export interface Project {
  slug: string;
  content: Record<Locale, LocalizedProjectContent>;
  technologies: readonly string[];
  repositoryUrl: string;
  asset: string;
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
    for (const key of [
      'title',
      'description',
      'eyebrow',
      'name',
      'role',
      'introduction',
      'aboutDescription',
      'portraitAlt',
      'skipLink',
      'projectsCta',
      'projectsEyebrow',
      'projectsTitle',
      'projectsDescription',
      'projectsScrollHint',
      'projectTechnologiesLabel',
      'aboutEyebrow',
      'aboutTitle',
      'technologiesEyebrow',
      'technologiesTitle',
      'technologiesDescription',
      'afterHoursEyebrow',
      'afterHoursTitle',
      'afterHoursDescription',
      'socialEyebrow',
      'socialTitle',
      'socialDescription',
      'repositoryLinkLabel',
      'languageNavigation',
      'englishLabel',
      'polishLabel',
    ]) {
      if (typeof page[key] !== 'string' || page[key].trim().length === 0) {
        errors.push(`Missing ${key} for locale: ${locale}`);
      }
    }
    if (page.role !== 'Junior Software Developer') {
      errors.push(`Unexpected role for locale: ${locale}`);
    }
    const afterHoursItems = page.afterHoursItems;
    if (
      !Array.isArray(afterHoursItems) ||
      afterHoursItems.length !== 3 ||
      afterHoursItems.some(
        (item) =>
          !item ||
          typeof item !== 'object' ||
          typeof (item as Record<string, unknown>).title !== 'string' ||
          !(item as Record<string, string>).title.trim() ||
          typeof (item as Record<string, unknown>).description !== 'string' ||
          !(item as Record<string, string>).description.trim(),
      )
    ) {
      errors.push(`Missing after-hours content for locale: ${locale}`);
    }
    const socialLabels = page.socialLinkLabels;
    for (const social of ['github', 'linkedin']) {
      const label = (socialLabels as Record<string, unknown> | undefined)?.[social];
      if (typeof label !== 'string' || label.trim().length === 0) {
        errors.push(`Missing social link label ${social} for locale: ${locale}`);
      }
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
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.slug)) {
    errors.push(`Invalid project slug: ${project.slug}`);
  }
  if (!project.content || typeof project.content !== 'object') {
    errors.push(`Missing localized project content: ${project.slug}`);
  } else {
    for (const locale of Object.keys(project.content)) {
      if (!locales.includes(locale as Locale)) {
        errors.push(`Unsupported project locale ${locale}: ${project.slug}`);
      }
    }
    for (const locale of locales) {
      const localized = project.content[locale];
      if (!localized || typeof localized !== 'object') {
        errors.push(`Missing project translation ${locale}: ${project.slug}`);
        continue;
      }
      for (const field of ['name', 'summary'] as const) {
        if (typeof localized[field] !== 'string' || localized[field].trim() === '') {
          errors.push(`Missing project ${field} for ${locale}: ${project.slug}`);
        }
      }
      const publishedCopy = Object.values(localized).join(' ');
      if (/hop\s*on|hopon/i.test(publishedCopy)) {
        errors.push(`Excluded project name found in ${locale}: ${project.slug}`);
      }
    }
  }

  if (
    !Array.isArray(project.technologies) ||
    project.technologies.length < 3 ||
    project.technologies.some((technology) => typeof technology !== 'string' || !technology.trim())
  ) {
    errors.push('Project technologies must contain at least three non-empty values.');
  } else if (new Set(project.technologies).size !== project.technologies.length) {
    errors.push('Project technologies must be unique.');
  }

  if (!project.repositoryUrl || !validateExternalUrl(project.repositoryUrl)) {
    errors.push('Project repository URL is invalid.');
  } else {
    const repository = new URL(project.repositoryUrl);
    if (
      repository.hostname !== 'github.com' ||
      repository.pathname.split('/').filter(Boolean).length !== 2 ||
      repository.search !== '' ||
      repository.hash !== ''
    ) {
      errors.push('Project repository URL must point to a GitHub repository.');
    }
  }
  if (
    typeof project.asset !== 'string' ||
    !project.asset.startsWith('/assets/projects/') ||
    !/\.(?:svg|webp)$/.test(project.asset)
  ) {
    errors.push(`Project artwork must be a local SVG or WebP: ${project.slug}`);
  }
  return errors;
}

export function validateProjectManifest(projects: readonly Project[]): string[] {
  const errors: string[] = [];
  const expectedOrder = ['fraud-detection-platform', 'stockrescue-ai', 'chess-project', 'library'];
  if (!Array.isArray(projects) || projects.length !== expectedOrder.length) {
    return [`Project manifest must contain exactly ${expectedOrder.length} projects.`];
  }

  const slugs = projects.map((project) => project.slug);
  if (new Set(slugs).size !== slugs.length) errors.push('Project slugs must be unique.');
  if (slugs.some((slug, index) => slug !== expectedOrder[index])) {
    errors.push(`Project order must be ${expectedOrder.join(' → ')}.`);
  }
  for (const project of projects) errors.push(...validateProject(project));
  return errors;
}
