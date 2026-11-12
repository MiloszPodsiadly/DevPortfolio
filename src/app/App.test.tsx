import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from './App';

describe('portfolio page', () => {
  it('keeps the decorative scene when the optional portrait is unavailable', () => {
    render(<App locale="en" />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(document.querySelector('.hero-scene')).toBeInTheDocument();
  });

  it.each([
    ['en', 'Portrait of Miłosz Podsiadły'],
    ['pl', 'Portret Miłosza Podsiadłego'],
  ] as const)('renders the localized portrait for %s', (locale, alt) => {
    render(<App locale={locale} portraitAvailable />);

    const portrait = screen.getByRole('img', { name: alt });
    expect(portrait).toHaveAttribute('src', '/assets/portraits/hero-960.webp');
    expect(portrait).toHaveAttribute(
      'srcset',
      '/assets/portraits/hero-480.webp 480w, /assets/portraits/hero-960.webp 960w',
    );
    expect(portrait).toHaveAttribute('fetchpriority', 'high');
  });

  it('retains the scene fallback if an optional portrait fails to load', () => {
    render(<App locale="en" portraitAvailable />);
    const portrait = screen.getByRole('img', { name: 'Portrait of Miłosz Podsiadły' });
    fireEvent.error(portrait);

    expect(portrait).toHaveAttribute('hidden');
    expect(document.querySelector('.hero-scene')).toBeInTheDocument();
  });

  it.each(['en', 'pl'] as const)(
    'renders the approved content and locale links for %s',
    (locale) => {
      render(<App locale={locale} />);
      const skipLinkName = locale === 'en' ? 'Skip to main content' : 'Przejdź do treści';

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('Junior Software Developer');
      expect(screen.getByRole('link', { name: skipLinkName })).toHaveAttribute(
        'href',
        '#main-content',
      );

      const navigation = screen.getByRole('navigation');
      const projectsLabel = locale === 'en' ? 'Projects' : 'Projekty';
      const aboutLabel = locale === 'en' ? 'About' : 'O mnie';
      const technologiesLabel = locale === 'en' ? 'Technologies' : 'Technologie';
      const socialLabel = locale === 'en' ? 'Profiles' : 'Profile';
      expect(within(navigation).getByRole('link', { name: projectsLabel })).toHaveAttribute(
        'href',
        '#projects',
      );
      expect(within(navigation).getByRole('link', { name: aboutLabel })).toHaveAttribute(
        'href',
        '#about',
      );
      expect(within(navigation).getByRole('link', { name: technologiesLabel })).toHaveAttribute(
        'href',
        '#technologies',
      );
      expect(within(navigation).getByRole('link', { name: socialLabel })).toHaveAttribute(
        'href',
        '#social',
      );
      expect(within(navigation).getByRole('link', { name: 'English' })).toHaveAttribute(
        'href',
        '/en/',
      );
      expect(within(navigation).getByRole('link', { name: 'Polski' })).toHaveAttribute(
        'href',
        '/pl/',
      );
      const openMenuLabel = locale === 'en' ? 'Open menu' : 'Otwórz menu';
      expect(screen.getByRole('button', { name: openMenuLabel })).toHaveAttribute(
        'aria-expanded',
        'false',
      );
      expect(document.querySelectorAll('a[href="#"]')).toHaveLength(0);
      expect(screen.getByRole('link', { name: /GitHub profile|Profil GitHub/i })).toHaveAttribute(
        'target',
        '_blank',
      );
      expect(
        screen.getByRole('link', { name: /LinkedIn profile|Profil LinkedIn/i }),
      ).toHaveAttribute('rel', 'noopener noreferrer');
      expect(
        screen.queryByRole('link', { name: /e-mail|email|instagram|discord/i }),
      ).not.toBeInTheDocument();
      expect(screen.getAllByRole('article')).toHaveLength(3);
      expect(
        screen.getByRole('heading', {
          level: 2,
          name: locale === 'en' ? 'After hours' : 'Po godzinach',
        }),
      ).toBeInTheDocument();

      const scene = document.querySelector('.hero-scene');
      expect(scene).toHaveAttribute('aria-hidden', 'true');
      expect(scene?.querySelector('svg')).toHaveAttribute('focusable', 'false');
      expect(scene?.querySelectorAll('a, button, [tabindex]')).toHaveLength(0);
    },
  );
});
