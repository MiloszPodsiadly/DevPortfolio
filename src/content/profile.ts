import { locales, pageContent, type Locale } from '../locales';

export interface SiteProfile {
  name: string;
  role: 'Junior Software Developer';
  introduction: string;
}

export interface LocalizedProjectContent {
  name: string;
  summary: string;
  problem: string;
  solution: string;
  role: string;
}

export interface Project {
  slug: string;
  content: Record<Locale, LocalizedProjectContent>;
  technologies: readonly string[];
  repositoryUrl: string;
  demoUrl?: string;
  demoUrlApproved?: boolean;
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
      'primaryNavigation',
      'projectsLabel',
      'aboutLabel',
      'technologiesLabel',
      'socialLabel',
      'openMenuLabel',
      'closeMenuLabel',
      'projectsCta',
      'projectsEyebrow',
      'projectsTitle',
      'projectsDescription',
      'projectProblemLabel',
      'projectSolutionLabel',
      'projectRoleLabel',
      'projectTechnologiesLabel',
      'aboutEyebrow',
      'aboutTitle',
      'technologiesEyebrow',
      'technologiesTitle',
      'technologiesDescription',
      'portfolioStackLabel',
      'siteTechnologiesLabel',
      'afterHoursEyebrow',
      'afterHoursTitle',
      'afterHoursDescription',
      'socialEyebrow',
      'socialTitle',
      'socialDescription',
      'repositoryLinkLabel',
      'demoLinkLabel',
      'languageNavigation',
      'englishLabel',
      'polishLabel',
    ]) {
      if (typeof page[key] !== 'string' || page[key].trim().length === 0) {
        errors.push(`Missing ${key} for locale: ${locale}`);
      }
    }
    if (
      !Array.isArray(page.siteTechnologies) ||
      page.siteTechnologies.length === 0 ||
      page.siteTechnologies.some(
        (technology) => typeof technology !== 'string' || !technology.trim(),
      )
    ) {
      errors.push(`Missing site technologies for locale: ${locale}`);
    }
    if (page.role !== 'Junior Software Developer') {
      errors.push(`Unexpected role for locale: ${locale}`);
    }
    const groupLabels = page.technologyGroupLabels;
    for (const group of ['backend', 'eventDriven', 'data', 'frontend', 'tooling']) {
      const label = (groupLabels as Record<string, unknown> | undefined)?.[group];
      if (typeof label !== 'string' || label.trim().length === 0) {
        errors.push(`Missing technology group label ${group} for locale: ${locale}`);
      }
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
      for (const field of ['name', 'summary', 'problem', 'solution', 'role'] as const) {
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
    project.technologies.length > 7 ||
    project.technologies.some((technology) => typeof technology !== 'string' || !technology.trim())
  ) {
    errors.push('Project technologies must contain between three and seven non-empty values.');
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
  if (project.demoUrl) {
    if (!validateExternalUrl(project.demoUrl)) errors.push('Project demo URL is invalid.');
    if (project.demoUrlApproved !== true) errors.push('Project demo URL lacks owner approval.');
  } else if (project.demoUrlApproved) {
    errors.push('A demo URL approval requires a demo URL.');
  }
  if (
    typeof project.asset !== 'string' ||
    !project.asset.startsWith('/assets/projects/') ||
    !project.asset.endsWith('.svg')
  ) {
    errors.push(`Project artwork must be a local SVG: ${project.slug}`);
  }
  if (project.publicationStatus !== 'published') {
    errors.push(`Project must be marked published in the portfolio: ${project.slug}`);
  }
  return errors;
}

export function validateProjectManifest(projects: readonly Project[]): string[] {
  const errors: string[] = [];
  const expectedOrder = ['fraud-detection-platform', 'stockrescue-ai', 'chess-project'];
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
