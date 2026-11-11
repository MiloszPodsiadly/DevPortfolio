export const locales = ['en', 'pl'] as const;

export type Locale = (typeof locales)[number];

export interface PageContent {
  title: string;
  description: string;
  eyebrow: string;
  name: string;
  role: 'Junior Software Developer';
  introduction: string;
  skipLink: string;
  primaryNavigation: string;
  projectsLabel: string;
  aboutLabel: string;
  technologiesLabel: string;
  socialLabel: string;
  openMenuLabel: string;
  closeMenuLabel: string;
  projectsCta: string;
  projectsEyebrow: string;
  projectsTitle: string;
  projectsDescription: string;
  aboutEyebrow: string;
  aboutTitle: string;
  technologiesEyebrow: string;
  technologiesTitle: string;
  technologiesDescription: string;
  siteTechnologiesLabel: string;
  siteTechnologies: string[];
  socialEyebrow: string;
  socialTitle: string;
  socialDescription: string;
  repositoryLinkLabel: string;
  demoLinkLabel: string;
  languageNavigation: string;
  englishLabel: string;
  polishLabel: string;
}

export const pageContent: Record<Locale, PageContent> = {
  en: {
    title: 'Junior Software Developer — Miłosz Podsiadły',
    description: 'A simple introduction to Miłosz Podsiadły and this personal portfolio.',
    eyebrow: 'Personal portfolio',
    name: 'Miłosz Podsiadły',
    role: 'Junior Software Developer',
    introduction:
      'A personal portfolio in progress, built to share a little about my work and interests.',
    skipLink: 'Skip to main content',
    primaryNavigation: 'Main navigation',
    projectsLabel: 'Projects',
    aboutLabel: 'About',
    technologiesLabel: 'Technologies',
    socialLabel: 'Profiles',
    openMenuLabel: 'Open menu',
    closeMenuLabel: 'Close menu',
    projectsCta: 'View projects',
    projectsEyebrow: 'Selected work',
    projectsTitle: 'Featured projects',
    projectsDescription:
      'A personal portfolio in progress, built to share a little about my work and interests.',
    aboutEyebrow: 'Profile',
    aboutTitle: 'About',
    technologiesEyebrow: 'Site stack',
    technologiesTitle: 'Technologies',
    technologiesDescription: 'Technologies used to build this portfolio:',
    siteTechnologiesLabel: 'Portfolio technologies',
    siteTechnologies: ['React', 'TypeScript', 'Vite', 'Tailwind CSS'],
    socialEyebrow: 'Links',
    socialTitle: 'Social profiles',
    socialDescription: 'Only confirmed public profile links appear here.',
    repositoryLinkLabel: 'Source code',
    demoLinkLabel: 'Live demo',
    languageNavigation: 'Choose a language',
    englishLabel: 'English',
    polishLabel: 'Polski',
  },
  pl: {
    title: 'Junior Software Developer — Miłosz Podsiadły',
    description: 'Krótkie wprowadzenie do Miłosza Podsiadłego i jego portfolio.',
    eyebrow: 'Portfolio osobiste',
    name: 'Miłosz Podsiadły',
    role: 'Junior Software Developer',
    introduction: 'Portfolio w budowie, w którym opowiem o swojej pracy i zainteresowaniach.',
    skipLink: 'Przejdź do treści',
    primaryNavigation: 'Nawigacja główna',
    projectsLabel: 'Projekty',
    aboutLabel: 'O mnie',
    technologiesLabel: 'Technologie',
    socialLabel: 'Profile',
    openMenuLabel: 'Otwórz menu',
    closeMenuLabel: 'Zamknij menu',
    projectsCta: 'Zobacz projekty',
    projectsEyebrow: 'Wybrane prace',
    projectsTitle: 'Wybrane projekty',
    projectsDescription:
      'Portfolio w budowie, w którym opowiem o swojej pracy i zainteresowaniach.',
    aboutEyebrow: 'Profil',
    aboutTitle: 'O mnie',
    technologiesEyebrow: 'Stack strony',
    technologiesTitle: 'Technologie',
    technologiesDescription: 'Technologie użyte do zbudowania tego portfolio:',
    siteTechnologiesLabel: 'Technologie portfolio',
    siteTechnologies: ['React', 'TypeScript', 'Vite', 'Tailwind CSS'],
    socialEyebrow: 'Linki',
    socialTitle: 'Profile społecznościowe',
    socialDescription: 'Widoczne są tu tylko potwierdzone linki do publicznych profili.',
    repositoryLinkLabel: 'Kod źródłowy',
    demoLinkLabel: 'Demo na żywo',
    languageNavigation: 'Wybierz język',
    englishLabel: 'English',
    polishLabel: 'Polski',
  },
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && locales.some((locale) => locale === value);
}

export function localeFromPath(pathname: string): Locale {
  const firstSegment = pathname.split('/').filter(Boolean)[0];
  return isLocale(firstSegment) ? firstSegment : 'en';
}

export function routeForLocale(locale: Locale): string {
  return `/${locale}/`;
}

export function getPageContent(locale: Locale): PageContent {
  return pageContent[locale];
}
