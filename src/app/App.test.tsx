import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from './App';

describe('portfolio page', () => {
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
      expect(screen.queryByRole('link', { name: /github|linkedin/i })).not.toBeInTheDocument();

      const scene = document.querySelector('.hero-scene');
      expect(scene).toHaveAttribute('aria-hidden', 'true');
      expect(scene?.querySelector('svg')).toHaveAttribute('focusable', 'false');
      expect(scene?.querySelectorAll('a, button, [tabindex]')).toHaveLength(0);
    },
  );
});
