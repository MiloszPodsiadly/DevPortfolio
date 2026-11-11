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
