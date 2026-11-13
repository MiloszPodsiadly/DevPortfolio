import { useState, type MouseEvent } from 'react';
import { projects } from '../content/projects';
import { socialLinks } from '../content/socials';
import { technologies } from '../content/skills';
import { getPageContent, routeForLocale, type Locale } from '../locales';
import { ProjectCard } from './ProjectCard';
import { HeroWorkspaceArt } from './scene/HeroWorkspaceArt';
import { InterestIcon } from './scene/InterestIcon';
import { SceneArt } from './scene/SceneArt';
import { SiteBackdrop } from './scene/SiteBackdrop';
import { TechnologyIcon } from './scene/TechnologyIcon';
const githubProfile = socialLinks.find((link) => link.id === 'github')!;

interface AppProps {
  locale: Locale;
  portraitAvailable?: boolean;
}

export function App({ locale, portraitAvailable = false }: AppProps) {
  const content = getPageContent(locale);
  const [portraitFailed, setPortraitFailed] = useState(false);
  const finalIntroWord = content.introduction.lastIndexOf(' ') + 1;

  function handleLocaleSwitch(event: MouseEvent<HTMLAnchorElement>, targetLocale: Locale) {
    const currentHash = window.location.hash;
    if (currentHash) event.currentTarget.href = `${routeForLocale(targetLocale)}${currentHash}`;
  }

  return (
    <div className="portfolio-stage">
      <div className="portfolio-shell">
        <div className="site-backdrop" aria-hidden="true">
          <SiteBackdrop />
        </div>
        <a className="skip-link" href="#main-content">
          {content.skipLink}
        </a>
        <header className="site-header">
          <nav className="language-nav" aria-label={content.languageNavigation}>
            <a
              href={routeForLocale('pl')}
              lang="pl"
              aria-current={locale === 'pl' ? 'page' : undefined}
              onClick={(event) => handleLocaleSwitch(event, 'pl')}
            >
              {content.polishLabel}
            </a>
            <a
              href={routeForLocale('en')}
              lang="en"
              aria-current={locale === 'en' ? 'page' : undefined}
              onClick={(event) => handleLocaleSwitch(event, 'en')}
            >
              {content.englishLabel}
            </a>
          </nav>
        </header>

        <main id="main-content" className="portfolio-main" tabIndex={-1}>
          <section className="hero-section content-container" aria-labelledby="hero-heading">
            <div className="hero-workspace" aria-hidden="true">
              <HeroWorkspaceArt />
            </div>
            <div className="hero-copy">
              <p className="eyebrow">{content.eyebrow}</p>
              <h1 id="hero-heading">
                <span className="hero-name">{content.name}</span>{' '}
                <span className="hero-role">{content.role}</span>
              </h1>
              <p className="intro-copy">
                {content.introduction.slice(0, finalIntroWord)}
                <span className="hero-intro-end">
                  {content.introduction.slice(finalIntroWord)}
                  <span className="hero-actions">
                    <a
                      className="button button-primary"
                      href={githubProfile.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {content.projectsCta}
                    </a>
                  </span>
                </span>
              </p>
            </div>
            <div className="hero-visual">
              {(!portraitAvailable || portraitFailed) && <SceneArt />}
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
                    setPortraitFailed(true);
                  }}
                />
              )}
            </div>
          </section>

          <div className="feature-row content-container">
            <section
              className="section project-section"
              id="projects"
              tabIndex={-1}
              aria-labelledby="projects-heading"
            >
              <div className="section-heading">
                <p className="eyebrow">{content.projectsEyebrow}</p>
                <h2 id="projects-heading">{content.projectsTitle}</h2>
                <p>{content.projectsDescription}</p>
                <span className="project-scroll-hint">
                  {content.projectsScrollHint}
                  <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
                    <path d="m5 7 5 5 5-5" />
                  </svg>
                </span>
              </div>
              <div
                className="project-grid"
                tabIndex={0}
                role="group"
                aria-label={content.projectsTitle}
              >
                {projects.map((project) => (
                  <ProjectCard
                    key={project.slug}
                    project={project}
                    locale={locale}
                    repositoryLabel={content.repositoryLinkLabel}
                    technologyListLabel={content.projectTechnologiesLabel}
                  />
                ))}
              </div>
            </section>

            <section
              className="overview-panel"
              id="about"
              tabIndex={-1}
              aria-labelledby="about-heading"
            >
              <div className="overview-panel-heading">
                <span
                  className="overview-panel-icon overview-panel-icon-profile"
                  aria-hidden="true"
                >
                  <img
                    src="/assets/profile/about-emblem.webp"
                    alt=""
                    width={384}
                    height={384}
                    decoding="async"
                  />
                </span>
                <div>
                  <p className="eyebrow">{content.aboutEyebrow}</p>
                  <h2 id="about-heading">{content.aboutTitle}</h2>
                </div>
              </div>
              <p>{content.aboutDescription}</p>
            </section>

            <section
              className="overview-panel"
              id="technologies"
              tabIndex={-1}
              aria-labelledby="technologies-heading"
            >
              <div className="overview-panel-heading">
                <span
                  className="overview-panel-icon overview-panel-icon-technology"
                  aria-hidden="true"
                >
                  <img
                    src="/assets/profile/technologies-emblem.webp"
                    alt=""
                    width={384}
                    height={384}
                    decoding="async"
                  />
                </span>
                <div>
                  <p className="eyebrow">{content.technologiesEyebrow}</p>
                  <h2 id="technologies-heading">{content.technologiesTitle}</h2>
                </div>
              </div>
              <p>{content.technologiesDescription}</p>
              <ul className="technology-showcase" aria-label={content.technologiesTitle}>
                {technologies.map((technology) => (
                  <li key={technology}>
                    <TechnologyIcon name={technology} />
                    <span>{technology}</span>
                  </li>
                ))}
              </ul>
            </section>
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
                  <li className={`interest-card interest-card-${item.id}`} key={item.id}>
                    <span className="interest-mark" aria-hidden="true">
                      <InterestIcon kind={item.id} />
                    </span>
                    <div className="interest-copy">
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                    </div>
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
                    <li className={`social-link social-link-${link.id}`} key={link.id}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${label} — ${content.name}`}
                      >
                        <span
                          className={`social-brand-icon social-brand-icon-${link.id}`}
                          aria-hidden="true"
                        >
                          <img
                            src={`/assets/social/${link.id}-emblem.webp`}
                            alt=""
                            width={256}
                            height={256}
                            decoding="async"
                          />
                        </span>
                        <span className="social-link-label">{label}</span>
                        <span className="social-link-arrow" aria-hidden="true">
                          <svg viewBox="0 0 24 24" fill="none" focusable="false">
                            <path d="M6 18 18 6M6 6h12v12" />
                          </svg>
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
