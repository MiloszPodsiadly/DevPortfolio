import { createRoot, hydrateRoot } from 'react-dom/client';
import { App } from './app/App';
import { isLocale, localeFromPath, type Locale } from './locales';
import './styles/globals.css';
import './styles/portfolio-canvas.css';

const container = document.getElementById('root');

if (!container) {
  throw new Error('The page is missing its React root element.');
}

const prerenderedLocale = container.dataset.locale;
const locale: Locale = isLocale(prerenderedLocale)
  ? prerenderedLocale
  : localeFromPath(window.location.pathname);
const portraitAvailable = container.dataset.portraitAvailable === 'true';

document.documentElement.lang = locale;
const app = <App locale={locale} portraitAvailable={portraitAvailable} />;

if (container.hasChildNodes()) {
  hydrateRoot(container, app, {
    onRecoverableError(error) {
      console.error('React hydration error:', error);
    },
  });
} else {
  createRoot(container).render(app);
}
