import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from './App';

describe('minimal portfolio page', () => {
  it.each(['en', 'pl'] as const)(
    'renders the approved content and locale links for %s',
    (locale) => {
      render(<App locale={locale} />);
      const skipLinkName = locale === 'en' ? 'Skip to main content' : 'Przejdź do treści';

      expect(
        screen.getByRole('heading', { level: 1, name: 'Junior Software Developer' }),
      ).toBeInTheDocument();
      expect(screen.getByRole('link', { name: skipLinkName })).toHaveAttribute(
        'href',
        '#main-content',
      );

      const navigation = screen.getByRole('navigation');
      expect(within(navigation).getByRole('link', { name: 'English' })).toHaveAttribute(
        'href',
        '/en/',
      );
      expect(within(navigation).getByRole('link', { name: 'Polski' })).toHaveAttribute(
        'href',
        '/pl/',
      );
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
      expect(
        screen.queryByRole('link', { name: /project|github|linkedin/i }),
      ).not.toBeInTheDocument();
    },
  );
});
