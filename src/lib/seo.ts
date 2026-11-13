import { getPageContent, type Locale } from '../locales';
import { escapeHtml } from './html.mjs';
import { validateSiteOrigin } from './site-url.mjs';

export const socialPreviewImagePath = '/assets/og/portfolio-cover.png';

export const ownerPersonModel = Object.freeze({
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Miłosz Podsiadły',
  jobTitle: 'Junior Software Developer',
  sameAs: Object.freeze([
    'https://github.com/MiloszPodsiadly',
    'https://www.linkedin.com/in/milosz-podsiadly/',
  ]),
});

export interface SeoMetadata {
  title: string;
  description: string;
}

export function getSeoMetadata(locale: Locale): SeoMetadata {
  const { title, description } = getPageContent(locale);
  return { title, description };
}

export function renderSeoMetadata(metadata: SeoMetadata): string {
  return [
    `    <title>${escapeHtml(metadata.title)}</title>`,
    `    <meta name="description" content="${escapeHtml(metadata.description)}" />`,
  ].join('\n');
}

export function renderSocialMetadata(
  metadata: SeoMetadata,
  locale: Locale,
  siteUrl?: string,
): string {
  const siteOrigin = validateSiteOrigin(siteUrl);
  const localeCode = locale === 'en' ? 'en_US' : 'pl_PL';
  const imageAlt =
    locale === 'en'
      ? 'Blue and violet portfolio cover for Miłosz Podsiadły, Junior Software Developer'
      : 'Niebiesko-fioletowa okładka portfolio Miłosza Podsiadłego — Junior Software Developer';
  const tags = [
    `    <meta property="og:type" content="website" />`,
    `    <meta property="og:locale" content="${localeCode}" />`,
    `    <meta property="og:title" content="${escapeHtml(metadata.title)}" />`,
    `    <meta property="og:description" content="${escapeHtml(metadata.description)}" />`,
    `    <meta property="og:site_name" content="Miłosz Podsiadły" />`,
  ];

  if (siteOrigin) {
    const imageUrl = `${siteOrigin}${socialPreviewImagePath}`;
    const pageUrl = `${siteOrigin}/${locale}/`;
    tags.push(
      `    <meta property="og:url" content="${escapeHtml(pageUrl)}" />`,
      `    <meta property="og:image" content="${escapeHtml(imageUrl)}" />`,
      `    <meta property="og:image:width" content="1200" />`,
      `    <meta property="og:image:height" content="630" />`,
      `    <meta property="og:image:alt" content="${escapeHtml(imageAlt)}" />`,
      `    <meta name="twitter:card" content="summary_large_image" />`,
      `    <meta name="twitter:title" content="${escapeHtml(metadata.title)}" />`,
      `    <meta name="twitter:description" content="${escapeHtml(metadata.description)}" />`,
      `    <meta name="twitter:image" content="${escapeHtml(imageUrl)}" />`,
      `    <meta name="twitter:image:alt" content="${escapeHtml(imageAlt)}" />`,
    );
  }

  return tags.join('\n');
}

export function getPersonJsonLd(locale: Locale, siteUrl?: string) {
  const siteOrigin = validateSiteOrigin(siteUrl);
  return {
    ...ownerPersonModel,
    ...(siteOrigin ? { url: `${siteOrigin}/${locale}/` } : {}),
  };
}

export function serializeJsonForHtml(value: unknown): string {
  const serialized = JSON.stringify(value);
  if (serialized === undefined) throw new Error('JSON-LD value must be serializable.');
  return serialized
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

export function renderPersonJsonLd(locale: Locale, siteUrl?: string): string {
  return `    <script type="application/ld+json">${serializeJsonForHtml(getPersonJsonLd(locale, siteUrl))}</script>`;
}
