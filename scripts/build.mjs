import { access, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build as viteBuild } from 'vite';

const root = resolve(import.meta.dirname, '..');
const distDirectory = join(root, 'dist');
const clientEntry = join(root, 'src', 'entry-client.tsx');
const serverEntry = join(root, 'src', 'entry-server.tsx');
const portraitFiles = ['hero-480.webp', 'hero-960.webp'].map((file) =>
  join(root, 'public', 'assets', 'portraits', file),
);

async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }
}

const portraitFileStates = await Promise.all(portraitFiles.map(fileExists));
if (portraitFileStates.some(Boolean) && !portraitFileStates.every(Boolean)) {
  throw new Error('Portrait export requires both hero-480.webp and hero-960.webp.');
}
const portraitAvailable = portraitFileStates.every(Boolean);

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return entities[character];
  });
}

function stylesheetLinks(assets) {
  return (assets.css ?? [])
    .map((file) => `    <link rel="stylesheet" href="/${escapeHtml(file)}" />`)
    .join('\n');
}

function pageShell(locale, renderedPage, assets, siteOrigin, hasPortrait) {
  const title = escapeHtml(renderedPage.page.title);
  const description = escapeHtml(renderedPage.page.description);
  const styles = stylesheetLinks(assets);
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
    <title>${title}</title>
    <meta name="description" content="${description}" />
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

  const siteOrigin = serverModule.validateSiteOrigin(process.env.SITE_URL);
  for (const locale of ['en', 'pl']) {
    const renderedPage = serverModule.render(locale, portraitAvailable);
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

  await rm(join(distDirectory, '.vite'), { recursive: true, force: true });
} finally {
  await rm(temporaryServerBuild, { recursive: true, force: true });
}

console.log(`Static pages generated in ${basename(distDirectory)} for /en/ and /pl/.`);
