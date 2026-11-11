import { createRoot, hydrateRoot } from 'react-dom/client';
import { App } from './app/App';
import { isLocale, localeFromPath, type Locale } from './locales';
import './styles/globals.css';

const container = document.getElementById('root');

if (!container) {
  throw new Error('The page is missing its React root element.');
}

const prerenderedLocale = container.dataset.locale;
const locale: Locale = isLocale(prerenderedLocale)
  ? prerenderedLocale
  : localeFromPath(window.location.pathname);

document.documentElement.lang = locale;
document.documentElement.classList.add('js');
const app = <App locale={locale} />;

if (container.hasChildNodes()) {
  hydrateRoot(container, app, {
    onRecoverableError(error) {
      console.error('React hydration error:', error);
    },
  });
} else {
  createRoot(container).render(app);
}
