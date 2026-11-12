import { renderToString } from 'react-dom/server';
import { App } from './app/App';
import { validateLocaleContent, validateProjectManifest } from './content/profile';
import { projects } from './content/projects';
import { validateTechnologyGroups } from './content/skills';
import { validateSocialLinks } from './content/socials';
import { getPageContent, pageContent, type Locale } from './locales';
export { validateSiteOrigin } from './lib/site-url.mjs';

const contentErrors = [
  ...validateLocaleContent(pageContent),
  ...validateProjectManifest(projects),
  ...validateTechnologyGroups(),
  ...validateSocialLinks(),
];
if (contentErrors.length > 0) {
  throw new Error(`Invalid locale content: ${contentErrors.join('; ')}`);
}

export function render(locale: Locale, portraitAvailable = false) {
  return {
    html: renderToString(<App locale={locale} portraitAvailable={portraitAvailable} />),
    page: getPageContent(locale),
  };
}
