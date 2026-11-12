import { useRef, useState, type KeyboardEvent, type MouseEvent } from 'react';
import { projects } from '../content/projects';
import { socialLinks } from '../content/socials';
import { technologyGroups } from '../content/skills';
import { getPageContent, routeForLocale, type Locale } from '../locales';
import { ProjectCard } from './ProjectCard';
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
            <div className="project-grid">
              {projects.map((project) => (
                <ProjectCard
                  key={project.slug}
                  project={project}
                  locale={locale}
                  repositoryLabel={content.repositoryLinkLabel}
                  demoLabel={content.demoLinkLabel}
                  problemLabel={content.projectProblemLabel}
                  solutionLabel={content.projectSolutionLabel}
                  roleLabel={content.projectRoleLabel}
                  technologyListLabel={content.projectTechnologiesLabel}
                />
              ))}
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
              <p>{content.aboutDescription}</p>
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
              <div className="technology-groups">
                {technologyGroups.map((group) => (
                  <section className="technology-group" key={group.id}>
                    <h3>{content.technologyGroupLabels[group.id]}</h3>
                    <ul className="technology-list">
                      {group.technologies.map((technology) => (
                        <li key={technology}>{technology}</li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
              <p className="portfolio-stack">
                <span>{content.portfolioStackLabel}:</span> {content.siteTechnologies.join(' · ')}
              </p>
            </section>
          </div>
        </div>

        <section
          className="section after-hours-section"
          id="after-hours"
          aria-labelledby="after-hours-heading"
        >
          <div className="content-container">
            <div className="section-heading">
              <p className="eyebrow">{content.afterHoursEyebrow}</p>
              <h2 id="after-hours-heading">{content.afterHoursTitle}</h2>
              <p>{content.afterHoursDescription}</p>
            </div>
            <ul className="interest-grid">
              {content.afterHoursItems.map((item) => (
                <li className="interest-card" key={item.id}>
                  <span className="interest-mark" aria-hidden="true">
                    {item.id === 'chess' ? '♞' : item.id === 'fantasy' ? '☾' : '✦'}
                  </span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section
          className="section social-section"
          id="social"
          tabIndex={-1}
          aria-labelledby="social-heading"
        >
          <div className="content-container">
            <div className="section-heading">
              <p className="eyebrow">{content.socialEyebrow}</p>
              <h2 id="social-heading">{content.socialTitle}</h2>
              <p>{content.socialDescription}</p>
            </div>
            <ul className="social-links">
              {socialLinks.map((link) => {
                const label = content.socialLinkLabels[link.id];
                return (
                  <li key={link.id}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${label} — ${content.name}`}
                    >
                      {label}
                      <span aria-hidden="true"> ↗</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      </main>

      <footer className="site-footer content-container">
        <span>{content.name}</span>
        <span aria-hidden="true">·</span>
        <span>{content.role}</span>
      </footer>
    </>
  );
}
