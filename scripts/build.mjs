import { readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build as viteBuild } from 'vite';
import { getPortraitAvailability } from './portrait-assets.mjs';
import { escapeHtml } from '../src/lib/html.mjs';
import { validateSiteOrigin } from '../src/lib/site-url.mjs';

const root = resolve(import.meta.dirname, '..');
const distDirectory = resolve(process.env.PORTFOLIO_DIST_DIR ?? join(root, 'dist'));
const clientEntry = join(root, 'src', 'entry-client.tsx');
const serverEntry = join(root, 'src', 'entry-server.tsx');
const siteOrigin = validateSiteOrigin(process.env.SITE_URL);
const portraitAvailable = await getPortraitAvailability(join(root, 'public'));

function stylesheetLinks(assets) {
  return (assets.css ?? [])
    .map((file) => `    <link rel="stylesheet" href="/${escapeHtml(file)}" />`)
    .join('\n');
}

function escapeXml(value) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&apos;',
    };
    return entities[character];
  });
}

function sitemapXml(siteOrigin) {
  const entries = ['en', 'pl']
    .map((locale) => `  <url>\n    <loc>${escapeXml(`${siteOrigin}/${locale}/`)}</loc>\n  </url>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
}

function robotsTxt(siteOrigin) {
  const lines = ['User-agent: *', 'Allow: /'];
  if (siteOrigin) lines.push(`Sitemap: ${siteOrigin}/sitemap.xml`);
  return `${lines.join('\n')}\n`;
}

function pageShell(locale, renderedPage, assets, siteOrigin, hasPortrait) {
  const styles = stylesheetLinks(assets);
  const robots = siteOrigin ? '' : '    <meta name="robots" content="noindex, nofollow" />\n';
  const canonical = siteOrigin
    ? [
        `    <link rel="canonical" href="${siteOrigin}/${locale}/" />`,
        ...['en', 'pl'].map(
          (language) =>
            `    <link rel="alternate" hreflang="${language}" href="${siteOrigin}/${language}/" />`,
        ),
        `    <link rel="alternate" hreflang="x-default" href="${siteOrigin}/en/" />`,
      ].join('\n')
    : '';

  return `<!doctype html>
<html lang="${locale}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#070D20" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
${robots}${renderedPage.seoHtml}
${renderedPage.socialHtml}
${renderedPage.structuredDataHtml}
${canonical ? `${canonical}\n` : ''}${styles ? `${styles}\n` : ''}    <script type="module" crossorigin src="/${escapeHtml(assets.file)}"></script>
  </head>
  <body>
    <div id="root" data-locale="${locale}" data-portrait-available="${hasPortrait}">${renderedPage.html}</div>
  </body>
</html>
`;
}

await rm(distDirectory, { recursive: true, force: true });
await viteBuild({
  configFile: join(root, 'vite.config.ts'),
  root,
  mode: 'production',
  build: {
    outDir: distDirectory,
    emptyOutDir: true,
    manifest: '.vite/manifest.json',
    rollupOptions: { input: clientEntry },
  },
});

const temporaryServerBuild = await import('node:fs/promises').then(({ mkdtemp }) =>
  mkdtemp(join(root, '.ssr-build-')),
);

try {
  await viteBuild({
    configFile: join(root, 'vite.config.ts'),
    root,
    mode: 'production',
    build: {
      ssr: serverEntry,
      outDir: temporaryServerBuild,
      emptyOutDir: true,
      manifest: false,
      rollupOptions: { input: { 'entry-server': serverEntry } },
    },
  });

  const serverFiles = (await readdir(temporaryServerBuild, { recursive: true })).filter((file) =>
    file.endsWith('.js'),
  );
  const serverBundle = serverFiles.find((file) => file.includes('entry-server')) ?? serverFiles[0];
  if (!serverBundle) throw new Error('Vite did not emit the temporary server renderer.');

  const serverModule = await import(pathToFileURL(join(temporaryServerBuild, serverBundle)).href);
  const manifestPath = join(distDirectory, '.vite', 'manifest.json');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  const clientAssets = Object.values(manifest).find(
    (entry) => entry.isEntry && entry.src?.endsWith('entry-client.tsx'),
  );
  if (!clientAssets?.file) throw new Error('Vite manifest is missing the client entry assets.');

  const notFoundPath = join(distDirectory, '404.html');
  const notFoundHtml = await readFile(notFoundPath, 'utf8');
  const notFoundStyles = stylesheetLinks(clientAssets);
  if (!notFoundStyles) throw new Error('Vite manifest is missing the shared stylesheet.');
  if (!notFoundHtml.includes('</head>')) throw new Error('The 404 template is missing </head>.');
  await writeFile(
    notFoundPath,
    notFoundHtml.replace('</head>', `${notFoundStyles}\n  </head>`),
    'utf8',
  );

  for (const locale of ['en', 'pl']) {
    const renderedPage = serverModule.render(locale, portraitAvailable, siteOrigin);
    const output = join(distDirectory, locale, 'index.html');
    await import('node:fs/promises').then(({ mkdir }) =>
      mkdir(join(distDirectory, locale), { recursive: true }),
    );
    await writeFile(
      output,
      pageShell(locale, renderedPage, clientAssets, siteOrigin, portraitAvailable),
      'utf8',
    );
  }

  await writeFile(join(distDirectory, 'robots.txt'), robotsTxt(siteOrigin), 'utf8');
  const sitemapPath = join(distDirectory, 'sitemap.xml');
  if (siteOrigin) {
    await writeFile(sitemapPath, sitemapXml(siteOrigin), 'utf8');
  } else {
    await rm(sitemapPath, { force: true });
  }

  await rm(join(distDirectory, '.vite'), { recursive: true, force: true });
} finally {
  await rm(temporaryServerBuild, { recursive: true, force: true });
}

console.log(`Static pages generated in ${basename(distDirectory)} for /en/ and /pl/.`);
