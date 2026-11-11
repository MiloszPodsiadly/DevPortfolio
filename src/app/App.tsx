import { useRef, useState, type KeyboardEvent, type MouseEvent } from 'react';
import { getPageContent, routeForLocale, type Locale } from '../locales';
import { SceneArt } from './scene/SceneArt';

interface AppProps {
  locale: Locale;
  portraitAvailable?: boolean;
}

export function App({ locale, portraitAvailable = false }: AppProps) {
  const content = getPageContent(locale);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  function focusSection(href: string | null) {
    if (!href?.startsWith('#')) return;
    const targetId = href.slice(1);
    window.requestAnimationFrame(() => {
      document.getElementById(targetId)?.focus({ preventScroll: true });
    });
  }

  function handleSectionNavigation(event: MouseEvent<HTMLAnchorElement>) {
    setMenuOpen(false);
    focusSection(event.currentTarget.getAttribute('href'));
  }

  function handleMenuKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key !== 'Escape' || !menuOpen) return;
    event.preventDefault();
    setMenuOpen(false);
    menuButtonRef.current?.focus();
  }

  function handleLocaleSwitch(event: MouseEvent<HTMLAnchorElement>, targetLocale: Locale) {
    const currentHash = window.location.hash;
    if (currentHash) event.currentTarget.href = `${routeForLocale(targetLocale)}${currentHash}`;
    setMenuOpen(false);
  }

  function toggleMenu() {
    const nextOpen = !menuOpen;
    setMenuOpen(nextOpen);
    if (nextOpen) {
      window.requestAnimationFrame(() => {
        document.querySelector<HTMLAnchorElement>('#primary-navigation a')?.focus();
      });
    }
  }

  return (
    <>
      <a className="skip-link" href="#main-content">
        {content.skipLink}
      </a>
      <header className="site-header" onKeyDown={handleMenuKeyDown}>
        <a className="brand-lockup" href={routeForLocale(locale)}>
          <span className="wordmark" aria-hidden="true">
            MP
          </span>
          <span className="brand-copy">
            <strong>{content.name}</strong>
            <small>{content.role}</small>
          </span>
        </a>
        <button
          ref={menuButtonRef}
          className="mobile-menu-toggle"
          type="button"
          aria-label={menuOpen ? content.closeMenuLabel : content.openMenuLabel}
          aria-controls="primary-navigation"
          aria-expanded={menuOpen}
          onClick={toggleMenu}
        >
          <span aria-hidden="true">{menuOpen ? '×' : '☰'}</span>
        </button>
        <nav
          id="primary-navigation"
          className="primary-nav"
          aria-label={content.primaryNavigation}
          data-open={menuOpen}
        >
          <div className="section-nav">
            <a href="#projects" onClick={handleSectionNavigation}>
              {content.projectsLabel}
            </a>
            <a href="#about" onClick={handleSectionNavigation}>
              {content.aboutLabel}
            </a>
            <a href="#technologies" onClick={handleSectionNavigation}>
              {content.technologiesLabel}
            </a>
            <a href="#social" onClick={handleSectionNavigation}>
              {content.socialLabel}
            </a>
          </div>
          <div className="language-nav" role="group" aria-label={content.languageNavigation}>
            <a
              href={routeForLocale('en')}
              lang="en"
              aria-current={locale === 'en' ? 'page' : undefined}
              onClick={(event) => handleLocaleSwitch(event, 'en')}
            >
              {content.englishLabel}
            </a>
            <a
              href={routeForLocale('pl')}
              lang="pl"
              aria-current={locale === 'pl' ? 'page' : undefined}
              onClick={(event) => handleLocaleSwitch(event, 'pl')}
            >
              {content.polishLabel}
            </a>
          </div>
        </nav>
      </header>

      <main id="main-content" tabIndex={-1}>
        <section className="hero-section content-container" aria-labelledby="hero-heading">
          <div className="hero-copy">
            <p className="eyebrow">{content.eyebrow}</p>
            <h1 id="hero-heading">
              <span className="hero-name">{content.name}</span>{' '}
              <span className="hero-role">{content.role}</span>
            </h1>
            <p className="intro-copy">{content.introduction}</p>
            <div className="hero-actions">
              <a
                className="button button-primary"
                href="#projects"
                onClick={handleSectionNavigation}
              >
                {content.projectsCta}
              </a>
            </div>
          </div>
          <div className="hero-visual">
            <SceneArt />
            {portraitAvailable && (
              <img
                className="hero-portrait"
                src="/assets/portraits/hero-960.webp"
                srcSet="/assets/portraits/hero-480.webp 480w, /assets/portraits/hero-960.webp 960w"
                sizes="(max-width: 640px) calc(100vw - 2rem), (max-width: 820px) 42vw, 38vw"
                alt={content.portraitAlt}
                width={960}
                height={1200}
                fetchPriority="high"
                decoding="async"
                onError={(event) => {
                  event.currentTarget.hidden = true;
                }}
              />
            )}
          </div>
        </section>

        <section
          className="section project-section"
          id="projects"
          tabIndex={-1}
          aria-labelledby="projects-heading"
        >
          <div className="content-container">
            <div className="section-heading">
              <p className="eyebrow">{content.projectsEyebrow}</p>
              <h2 id="projects-heading">{content.projectsTitle}</h2>
              <p>{content.projectsDescription}</p>
            </div>
          </div>
        </section>

        <div className="section overview-section">
          <div className="content-container overview-grid">
            <section
              className="overview-panel"
              id="about"
              tabIndex={-1}
              aria-labelledby="about-heading"
            >
              <p className="eyebrow">{content.aboutEyebrow}</p>
              <h2 id="about-heading">{content.aboutTitle}</h2>
              <p>{content.introduction}</p>
            </section>
            <section
              className="overview-panel"
              id="technologies"
              tabIndex={-1}
              aria-labelledby="technologies-heading"
            >
              <p className="eyebrow">{content.technologiesEyebrow}</p>
              <h2 id="technologies-heading">{content.technologiesTitle}</h2>
              <p>{content.technologiesDescription}</p>
              <ul className="technology-list" aria-label={content.siteTechnologiesLabel}>
                {content.siteTechnologies.map((technology) => (
                  <li key={technology}>{technology}</li>
                ))}
              </ul>
            </section>
            <section
              className="overview-panel"
              id="social"
              tabIndex={-1}
              aria-labelledby="social-heading"
            >
              <p className="eyebrow">{content.socialEyebrow}</p>
              <h2 id="social-heading">{content.socialTitle}</h2>
              <p>{content.socialDescription}</p>
            </section>
          </div>
        </div>
      </main>

      <footer className="site-footer content-container">
        <span>{content.name}</span>
        <span aria-hidden="true">·</span>
        <span>{content.role}</span>
      </footer>
    </>
  );
}
