import { renderToString } from 'react-dom/server';
import { App } from './app/App';
import { validateLocaleContent, validateProjectManifest } from './content/profile';
import { projects } from './content/projects';
import { validateTechnologyGroups } from './content/skills';
import { validateSocialLinks } from './content/socials';
import { pageContent, type Locale } from './locales';
import {
  getSeoMetadata,
  renderPersonJsonLd,
  renderSeoMetadata,
  renderSocialMetadata,
} from './lib/seo';
export { validateSiteOrigin } from './lib/site-url.mjs';
export {
  getPersonJsonLd,
  getSeoMetadata,
  renderPersonJsonLd,
  renderSeoMetadata,
  renderSocialMetadata,
} from './lib/seo';

const contentErrors = [
  ...validateLocaleContent(pageContent),
  ...validateProjectManifest(projects),
  ...validateTechnologyGroups(),
  ...validateSocialLinks(),
];
if (contentErrors.length > 0) {
  throw new Error(`Invalid locale content: ${contentErrors.join('; ')}`);
}

export function render(locale: Locale, portraitAvailable = false, siteUrl?: string) {
  const seo = getSeoMetadata(locale);
  return {
    html: renderToString(<App locale={locale} portraitAvailable={portraitAvailable} />),
    seo,
    seoHtml: renderSeoMetadata(seo),
    socialHtml: renderSocialMetadata(seo, locale, siteUrl),
    structuredDataHtml: renderPersonJsonLd(locale, siteUrl),
  };
}
