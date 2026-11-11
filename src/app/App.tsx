import { getPageContent, routeForLocale, type Locale } from '../locales';

interface AppProps {
  locale: Locale;
}

export function App({ locale }: AppProps) {
  const content = getPageContent(locale);

  return (
    <>
      <a className="skip-link" href="#main-content">
        {content.skipLink}
      </a>
      <header className="site-header">
        <a className="wordmark" href={routeForLocale(locale)} aria-label={`${content.name} — MP`}>
          MP
        </a>
        <nav className="language-nav" aria-label={content.languageNavigation}>
          <a
            href={routeForLocale('en')}
            lang="en"
            aria-current={locale === 'en' ? 'page' : undefined}
          >
            {content.englishLabel}
          </a>
          <a
            href={routeForLocale('pl')}
            lang="pl"
            aria-current={locale === 'pl' ? 'page' : undefined}
          >
            {content.polishLabel}
          </a>
        </nav>
      </header>
      <main className="intro" id="main-content">
        <p className="eyebrow">{content.eyebrow}</p>
        <h1>{content.role}</h1>
        <p className="person-name">{content.name}</p>
        <p className="intro-copy">{content.introduction}</p>
      </main>
      <footer className="site-footer">
        <span>{content.name}</span>
        <span aria-hidden="true">·</span>
        <span>{content.role}</span>
      </footer>
    </>
  );
}
