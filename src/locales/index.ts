export const locales = ['en', 'pl'] as const;

export type Locale = (typeof locales)[number];
export type TechnologyGroupId = 'backend' | 'eventDriven' | 'data' | 'frontend' | 'tooling';
export type SocialLinkId = 'github' | 'linkedin';
export type AfterHoursItemId = 'chess' | 'fantasy' | 'gaming';

export interface PageContent {
  title: string;
  description: string;
  eyebrow: string;
  name: string;
  role: 'Junior Software Developer';
  introduction: string;
  aboutDescription: string;
  portraitAlt: string;
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
  projectProblemLabel: string;
  projectSolutionLabel: string;
  projectRoleLabel: string;
  projectTechnologiesLabel: string;
  aboutEyebrow: string;
  aboutTitle: string;
  technologiesEyebrow: string;
  technologiesTitle: string;
  technologiesDescription: string;
  technologyGroupLabels: Record<TechnologyGroupId, string>;
  portfolioStackLabel: string;
  siteTechnologiesLabel: string;
  siteTechnologies: string[];
  afterHoursEyebrow: string;
  afterHoursTitle: string;
  afterHoursDescription: string;
  afterHoursItems: { id: AfterHoursItemId; title: string; description: string }[];
  socialEyebrow: string;
  socialTitle: string;
  socialDescription: string;
  socialLinkLabels: Record<SocialLinkId, string>;
  repositoryLinkLabel: string;
  demoLinkLabel: string;
  languageNavigation: string;
  englishLabel: string;
  polishLabel: string;
}

export const pageContent: Record<Locale, PageContent> = {
  en: {
    title: 'Miłosz Podsiadły — Junior Software Developer',
    description:
      'Personal portfolio of Miłosz Podsiadły, with projects in backend development, event-driven systems, inventory management, and chess.',
    eyebrow: 'Personal portfolio',
    name: 'Miłosz Podsiadły',
    role: 'Junior Software Developer',
    introduction:
      'I build applications and keep learning about backend development. I’m especially interested in event-driven systems, architecture and testing.',
    aboutDescription:
      'I’m a junior software developer who enjoys building backend applications and understanding how their parts work together. Personal projects let me explore event-driven design, architecture and testing in practice. I care about clear code and steady improvements that make software easier to maintain.',
    portraitAlt: 'Portrait of Miłosz Podsiadły',
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
      'A selection of personal projects, with descriptions based on their public documentation.',
    projectProblemLabel: 'Problem space',
    projectSolutionLabel: 'Project approach',
    projectRoleLabel: 'Context',
    projectTechnologiesLabel: 'Project technologies',
    aboutEyebrow: 'Profile',
    aboutTitle: 'About me',
    technologiesEyebrow: 'Project experience',
    technologiesTitle: 'Technologies',
    technologiesDescription:
      'Tools and technologies represented in the projects shown here. This list does not imply a level or certification.',
    technologyGroupLabels: {
      backend: 'Backend',
      eventDriven: 'Event-driven systems',
      data: 'Data and persistence',
      frontend: 'Frontend',
      tooling: 'Tooling and testing',
    },
    portfolioStackLabel: 'This portfolio is built with',
    siteTechnologiesLabel: 'Portfolio technologies',
    siteTechnologies: ['React', 'TypeScript', 'Vite', 'Tailwind CSS'],
    afterHoursEyebrow: 'Beyond code',
    afterHoursTitle: 'After hours',
    afterHoursDescription:
      'Away from the editor, I like activities that leave room to think, explore and unwind.',
    afterHoursItems: [
      { id: 'chess', title: 'Chess', description: 'A good excuse to think a few moves ahead.' },
      {
        id: 'fantasy',
        title: 'Fantasy books',
        description: 'Stories with worlds worth getting lost in.',
      },
      {
        id: 'gaming',
        title: 'Gaming',
        description: 'A relaxed way to enjoy a different kind of challenge.',
      },
    ],
    socialEyebrow: 'Contact',
    socialTitle: 'Find me online',
    socialDescription: 'These are the public profiles I’ve chosen to share.',
    socialLinkLabels: { github: 'GitHub profile', linkedin: 'LinkedIn profile' },
    repositoryLinkLabel: 'Source code',
    demoLinkLabel: 'Live demo',
    languageNavigation: 'Choose a language',
    englishLabel: 'English',
    polishLabel: 'Polski',
  },
  pl: {
    title: 'Portfolio Miłosza Podsiadłego — Junior Software Developer',
    description:
      'Portfolio Miłosza Podsiadłego z projektami z obszaru backendu, systemów zdarzeniowych, zarządzania zapasami i szachów.',
    eyebrow: 'Portfolio osobiste',
    name: 'Miłosz Podsiadły',
    role: 'Junior Software Developer',
    introduction:
      'Tworzę aplikacje i rozwijam się w obszarze backendu. Szczególnie interesują mnie systemy zdarzeniowe, architektura i testowanie.',
    aboutDescription:
      'Jestem programistą na początku kariery i lubię budować aplikacje backendowe oraz poznawać zależności między ich częściami. W projektach własnych sprawdzam w praktyce podejścia zdarzeniowe, architekturę i testowanie. Zależy mi na czytelnym kodzie i stopniowym ulepszaniu rozwiązań, które łatwiej utrzymać.',
    portraitAlt: 'Portret Miłosza Podsiadłego',
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
    projectsDescription: 'Projekty własne opisane na podstawie ich publicznej dokumentacji.',
    projectProblemLabel: 'Obszar problemu',
    projectSolutionLabel: 'Podejście projektu',
    projectRoleLabel: 'Kontekst',
    projectTechnologiesLabel: 'Technologie projektu',
    aboutEyebrow: 'Profil',
    aboutTitle: 'O mnie',
    technologiesEyebrow: 'Doświadczenia projektowe',
    technologiesTitle: 'Technologie',
    technologiesDescription:
      'Narzędzia i technologie obecne w pokazanych projektach. Lista nie określa poziomu umiejętności ani certyfikatów.',
    technologyGroupLabels: {
      backend: 'Backend',
      eventDriven: 'Systemy zdarzeniowe',
      data: 'Dane i persystencja',
      frontend: 'Frontend',
      tooling: 'Narzędzia i testowanie',
    },
    portfolioStackLabel: 'To portfolio powstało z użyciem',
    siteTechnologiesLabel: 'Technologie portfolio',
    siteTechnologies: ['React', 'TypeScript', 'Vite', 'Tailwind CSS'],
    afterHoursEyebrow: 'Poza kodem',
    afterHoursTitle: 'Po godzinach',
    afterHoursDescription:
      'Poza edytorem lubię zajęcia, które dają przestrzeń do myślenia, odkrywania i odpoczynku.',
    afterHoursItems: [
      {
        id: 'chess',
        title: 'Szachy',
        description: 'Dobry powód, by planować kilka ruchów naprzód.',
      },
      {
        id: 'fantasy',
        title: 'Fantastyka',
        description: 'Historie i światy, w których można się zatracić.',
      },
      { id: 'gaming', title: 'Gry', description: 'Spokojny sposób na inny rodzaj wyzwania.' },
    ],
    socialEyebrow: 'Kontakt',
    socialTitle: 'Znajdź mnie online',
    socialDescription: 'Udostępniam tutaj wybrane publiczne profile.',
    socialLinkLabels: { github: 'Profil GitHub', linkedin: 'Profil LinkedIn' },
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
