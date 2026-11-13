export const locales = ['en', 'pl'] as const;

export type Locale = (typeof locales)[number];
export type SocialLinkId = 'github' | 'linkedin';
export type AfterHoursItemId = 'games' | 'science-fantasy' | 'technology';

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
  projectsCta: string;
  projectsEyebrow: string;
  projectsTitle: string;
  projectsDescription: string;
  projectsScrollHint: string;
  projectTechnologiesLabel: string;
  aboutEyebrow: string;
  aboutTitle: string;
  technologiesEyebrow: string;
  technologiesTitle: string;
  technologiesDescription: string;
  afterHoursEyebrow: string;
  afterHoursTitle: string;
  afterHoursDescription: string;
  afterHoursItems: { id: AfterHoursItemId; title: string; description: string }[];
  socialEyebrow: string;
  socialTitle: string;
  socialDescription: string;
  socialLinkLabels: Record<SocialLinkId, string>;
  repositoryLinkLabel: string;
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
      'I’m a junior software developer who enjoys building applications and understanding how their parts work together. Ready to bring a professional approach and capacity for fast learning to support and strengthen the team. Personal projects let me explore event-driven design, architecture and testing in practice. I care about clear code and steady improvements that make software easier to maintain.',
    portraitAlt: 'Portrait of Miłosz Podsiadły',
    skipLink: 'Skip to main content',
    projectsCta: 'View projects',
    projectsEyebrow: 'Selected work',
    projectsTitle: 'Featured projects',
    projectsScrollHint: 'Scroll for more projects',
    projectsDescription:
      'A selection of personal projects, with descriptions based on their public documentation.',
    projectTechnologiesLabel: 'Tech',
    aboutEyebrow: 'Profile',
    aboutTitle: 'About me',
    technologiesEyebrow: 'Project experience',
    technologiesTitle: 'Technologies',
    technologiesDescription: 'Tools and technologies represented in the projects shown here.',
    afterHoursEyebrow: 'Beyond code',
    afterHoursTitle: 'After hours',
    afterHoursDescription:
      'Away from the editor, I like activities that leave room to think, explore and unwind.',
    afterHoursItems: [
      { id: 'games', title: 'Games', description: 'Board games and computer games.' },
      {
        id: 'science-fantasy',
        title: 'Science & Fantasy',
        description: 'New ideas, discoveries and imagined worlds.',
      },
      {
        id: 'technology',
        title: 'Technology',
        description: 'New tools and the world of IT.',
      },
    ],
    socialEyebrow: 'Contact',
    socialTitle: 'Find me online',
    socialDescription: 'These are the public profiles I’ve chosen to share.',
    socialLinkLabels: { github: 'GitHub profile', linkedin: 'LinkedIn profile' },
    repositoryLinkLabel: 'Source code',
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
      'Jestem programistą na początku kariery i lubię budować aplikacje oraz poznawać zależności między ich częściami. Jestem gotowy wnieść profesjonalne podejście i zdolność szybkiego uczenia się, aby wspierać i wzmacniać zespół. W projektach własnych poznaję w praktyce projektowanie zdarzeniowe, architekturę i testowanie. Zależy mi na czytelnym kodzie i stopniowych usprawnieniach, dzięki którym oprogramowanie łatwiej utrzymać.',
    portraitAlt: 'Portret Miłosza Podsiadłego',
    skipLink: 'Przejdź do treści',
    projectsCta: 'Zobacz projekty',
    projectsEyebrow: 'Wybrane prace',
    projectsTitle: 'Wybrane projekty',
    projectsScrollHint: 'Przewiń po więcej projektów',
    projectsDescription: 'Projekty własne opisane na podstawie ich publicznej dokumentacji.',
    projectTechnologiesLabel: 'Technologie',
    aboutEyebrow: 'Profil',
    aboutTitle: 'O mnie',
    technologiesEyebrow: 'Doświadczenia projektowe',
    technologiesTitle: 'Technologie',
    technologiesDescription: 'Narzędzia i technologie obecne w pokazanych projektach.',
    afterHoursEyebrow: 'Poza kodem',
    afterHoursTitle: 'Po godzinach',
    afterHoursDescription:
      'Poza edytorem lubię zajęcia, które dają przestrzeń do myślenia, odkrywania i odpoczynku.',
    afterHoursItems: [
      {
        id: 'games',
        title: 'Gry',
        description: 'Gry planszowe i komputerowe.',
      },
      {
        id: 'science-fantasy',
        title: 'Nauka i fantastyka',
        description: 'Nowe idee, odkrycia i fantastyczne światy.',
      },
      { id: 'technology', title: 'Technologia', description: 'Nowe narzędzia i świat IT.' },
    ],
    socialEyebrow: 'Kontakt',
    socialTitle: 'Znajdź mnie online',
    socialDescription: 'Udostępniam tutaj wybrane publiczne profile.',
    socialLinkLabels: { github: 'Profil GitHub', linkedin: 'Profil LinkedIn' },
    repositoryLinkLabel: 'Kod źródłowy',
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
