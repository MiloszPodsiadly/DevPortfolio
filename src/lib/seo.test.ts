import { describe, expect, it } from 'vitest';
import { render } from '../entry-server';
import { pageContent } from '../locales';
import { validateLocaleContent } from '../content/profile';
import {
  getPersonJsonLd,
  getSeoMetadata,
  ownerPersonModel,
  renderPersonJsonLd,
  renderSeoMetadata,
  renderSocialMetadata,
  serializeJsonForHtml,
} from './seo';

describe('localized SEO metadata', () => {
  it('uses the locale content as its single source of title and description', () => {
    const english = getSeoMetadata('en');
    const polish = getSeoMetadata('pl');

    expect(english).toEqual({
      title: pageContent.en.title,
      description: pageContent.en.description,
    });
    expect(polish).toEqual({
      title: pageContent.pl.title,
      description: pageContent.pl.description,
    });
    expect(english.title).toContain('Miłosz Podsiadły');
    expect(english.title).toContain('Junior Software Developer');
    expect(polish.title).toContain('Miłosza Podsiadłego');
    expect(polish.title).toContain('Junior Software Developer');
    expect(polish.title).not.toBe(english.title);
    expect(english.description).not.toBe(polish.description);
  });

  it('rejects missing title and description fields for both locales', () => {
    for (const locale of ['en', 'pl'] as const) {
      for (const [field, value] of [
        ['title', ' '],
        ['description', ''],
      ] as const) {
        const errors = validateLocaleContent({
          ...pageContent,
          [locale]: { ...pageContent[locale], [field]: value },
        });
        expect(errors).toContain(`Missing ${field} for locale: ${locale}`);
      }
    }
  });

  it('renders one title and description with HTML escaping applied exactly once', () => {
    const head = renderSeoMetadata({
      title: 'Miłosz & <Junior> "Developer"',
      description: "Portfolio <work> & 'projects'",
    });

    expect(head).toBe(
      '    <title>Miłosz &amp; &lt;Junior&gt; &quot;Developer&quot;</title>\n' +
        '    <meta name="description" content="Portfolio &lt;work&gt; &amp; &#39;projects&#39;" />',
    );
    expect(head.match(/<title>/g)).toHaveLength(1);
    expect(head.match(/<meta name="description"/g)).toHaveLength(1);
    expect(head).not.toContain('&amp;amp;');
  });

  it('provides localized SEO HTML to the static renderer', () => {
    for (const locale of ['en', 'pl'] as const) {
      const renderedPage = render(locale);

      expect(renderedPage.seo).toEqual(getSeoMetadata(locale));
      expect(renderedPage.seoHtml).toBe(renderSeoMetadata(renderedPage.seo));
      expect(renderedPage.socialHtml).toContain(
        `<meta property="og:locale" content="${locale === 'en' ? 'en_US' : 'pl_PL'}"`,
      );
      expect(renderedPage.structuredDataHtml).toContain('type="application/ld+json"');
    }
  });

  it('renders a complete localized social card only when the site origin is confirmed', () => {
    const english = renderSocialMetadata(getSeoMetadata('en'), 'en', 'https://portfolio.dev');
    const polish = renderSocialMetadata(getSeoMetadata('pl'), 'pl', 'https://portfolio.dev');

    expect(english.match(/property="og:/g)).toHaveLength(10);
    expect(english.match(/name="twitter:/g)).toHaveLength(5);
    expect(english).toContain('property="og:locale" content="en_US"');
    expect(english).toContain('property="og:url" content="https://portfolio.dev/en/"');
    expect(english).toContain(
      'property="og:image" content="https://portfolio.dev/assets/og/portfolio-cover.png"',
    );
    expect(english).toContain('property="og:image:width" content="1200"');
    expect(english).toContain('property="og:image:height" content="630"');
    expect(english).toContain('name="twitter:card" content="summary_large_image"');
    expect(polish).toContain('property="og:locale" content="pl_PL"');
    expect(polish).toContain('property="og:title" content="Portfolio Miłosza Podsiadłego');
    expect(polish).toContain(
      'property="og:image:alt" content="Niebiesko-fioletowa okładka portfolio Miłosza Podsiadłego',
    );
  });

  it('omits absolute-dependent social tags without SITE_URL and escapes localized copy once', () => {
    const unconfigured = renderSocialMetadata(getSeoMetadata('en'), 'en');
    const escaped = renderSocialMetadata(
      { title: 'Miłosz & <Developer>', description: 'Portfolio <work> & stories' },
      'en',
      'https://portfolio.dev',
    );

    expect(unconfigured).toContain('property="og:title"');
    expect(unconfigured).toContain('property="og:description"');
    expect(unconfigured).not.toMatch(/property="og:(url|image)|name="twitter:/);
    expect(escaped).toContain('content="Miłosz &amp; &lt;Developer&gt;"');
    expect(escaped).toContain('content="Portfolio &lt;work&gt; &amp; stories"');
    expect(escaped).not.toContain('&amp;amp;');
    expect(escaped.match(/property="og:title"/g)).toHaveLength(1);
    expect(escaped.match(/name="twitter:title"/g)).toHaveLength(1);
  });

  it('serializes only approved Person facts and adds a locale URL only for a verified origin', () => {
    const expectedProfile = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Miłosz Podsiadły',
      jobTitle: 'Junior Software Developer',
      sameAs: [
        'https://github.com/MiloszPodsiadly',
        'https://www.linkedin.com/in/milosz-podsiadly/',
      ],
    };

    expect(ownerPersonModel).toEqual(expectedProfile);
    expect(getPersonJsonLd('en')).toEqual(expectedProfile);
    expect(getPersonJsonLd('en', 'https://portfolio.dev')).toEqual({
      ...expectedProfile,
      url: 'https://portfolio.dev/en/',
    });
    expect(getPersonJsonLd('pl', 'https://portfolio.dev')).toEqual({
      ...expectedProfile,
      url: 'https://portfolio.dev/pl/',
    });

    const script = renderPersonJsonLd('pl', 'https://portfolio.dev');
    const json = script.match(/^\s*<script type="application\/ld\+json">([\s\S]*)<\/script>$/)?.[1];
    expect(script.match(/<script\b/g)).toHaveLength(1);
    expect(JSON.parse(json ?? 'null')).toEqual(getPersonJsonLd('pl', 'https://portfolio.dev'));
  });

  it('escapes HTML-sensitive and JavaScript separator characters inside JSON-LD data', () => {
    const unsafeValue = '</script><script>alert(1)</script>&\u2028\u2029';
    const serialized = serializeJsonForHtml({ name: unsafeValue });

    expect(serialized).not.toContain('</script>');
    expect(serialized).toContain('\\u003c/script\\u003e');
    expect(serialized).toContain('\\u0026');
    expect(serialized).toContain('\\u2028');
    expect(serialized).toContain('\\u2029');
    expect(JSON.parse(serialized)).toEqual({ name: unsafeValue });
  });
});
