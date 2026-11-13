import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { verifyOutput } from './verify-output.mjs';

let fixtureDirectory;

async function writeSocialImageFixture(directory) {
  const imageDirectory = join(directory, 'assets', 'og');
  await mkdir(imageDirectory, { recursive: true });
  const sourceImage = await readFile(
    join(process.cwd(), 'public', 'assets', 'og', 'portfolio-cover.png'),
  );
  await writeFile(join(imageDirectory, 'portfolio-cover.png'), sourceImage);
}

async function writeValidFixture(directory, siteOrigin, portraitAvailable = false) {
  await mkdir(join(directory, 'en'), { recursive: true });
  await mkdir(join(directory, 'pl'), { recursive: true });
  await mkdir(join(directory, 'assets'), { recursive: true });
  await mkdir(join(directory, 'assets', 'projects'), { recursive: true });
  await writeSocialImageFixture(directory);
  await writeFile(
    join(directory, 'favicon.svg'),
    await readFile(join(process.cwd(), 'public', 'favicon.svg')),
  );
  await writeFile(
    join(directory, 'favicon.png'),
    await readFile(join(process.cwd(), 'public', 'favicon.png')),
  );
  await writeFile(join(directory, 'assets', 'client-abcdef12.js'), '');
  await writeFile(join(directory, 'assets', 'site-abcdef12.css'), '');
  for (const artwork of [
    'fraud-signals.svg',
    'stock-rescue.svg',
    'chess-piece.svg',
    'library.svg',
  ]) {
    await writeFile(join(directory, 'assets', 'projects', artwork), '<svg></svg>');
  }
  if (portraitAvailable) {
    await mkdir(join(directory, 'assets', 'portraits'), { recursive: true });
    await writeFile(join(directory, 'assets', 'portraits', 'hero-480.webp'), '480');
    await writeFile(join(directory, 'assets', 'portraits', 'hero-960.webp'), '960');
  }
  await writeFile(join(directory, '_redirects'), '/ /en/ 302\n');
  await writeFile(
    join(directory, '404.html'),
    '<html lang="en"><head><meta name="theme-color" content="#070D20"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="icon" type="image/png" sizes="32x32" href="/favicon.png"><link rel="stylesheet" href="/assets/site-abcdef12.css"></head><body><main><h1>Page not found</h1><a href="/en/">English</a><a href="/pl/">Polski</a></main></body></html>',
  );
  const sitemapEntries = ['en', 'pl']
    .map((locale) => `  <url>\n    <loc>${siteOrigin}/${locale}/</loc>\n  </url>`)
    .join('\n');
  await writeFile(
    join(directory, 'robots.txt'),
    `User-agent: *\nAllow: /\n${siteOrigin ? `Sitemap: ${siteOrigin}/sitemap.xml\n` : ''}`,
  );
  if (siteOrigin) {
    await writeFile(
      join(directory, 'sitemap.xml'),
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries}\n</urlset>\n`,
    );
  }

  for (const locale of ['en', 'pl']) {
    const seo = siteOrigin
      ? [
          `<link rel="canonical" href="${siteOrigin}/${locale}/">`,
          ...['en', 'pl'].map(
            (language) =>
              `<link rel="alternate" hreflang="${language}" href="${siteOrigin}/${language}/">`,
          ),
          `<link rel="alternate" hreflang="x-default" href="${siteOrigin}/en/">`,
        ].join('')
      : '<meta name="robots" content="noindex, nofollow">';
    const title =
      locale === 'en'
        ? 'Miłosz Podsiadły — Junior Software Developer'
        : 'Portfolio Miłosza Podsiadłego — Junior Software Developer';
    const description =
      locale === 'en'
        ? 'Personal portfolio of Miłosz Podsiadły, with projects in backend development.'
        : 'Portfolio Miłosza Podsiadłego z projektami z obszaru backendu.';
    const imageAlt =
      locale === 'en'
        ? 'Blue and violet portfolio cover for Miłosz Podsiadły, Junior Software Developer'
        : 'Niebiesko-fioletowa okładka portfolio Miłosza Podsiadłego — Junior Software Developer';
    const imageUrl = `${siteOrigin}/assets/og/portfolio-cover.png`;
    const socialMetadata = [
      `<meta property="og:type" content="website">`,
      `<meta property="og:locale" content="${locale === 'en' ? 'en_US' : 'pl_PL'}">`,
      `<meta property="og:title" content="${title}">`,
      `<meta property="og:description" content="${description}">`,
      '<meta property="og:site_name" content="Miłosz Podsiadły">',
      ...(siteOrigin
        ? [
            `<meta property="og:url" content="${siteOrigin}/${locale}/">`,
            `<meta property="og:image" content="${imageUrl}">`,
            '<meta property="og:image:width" content="1200">',
            '<meta property="og:image:height" content="630">',
            `<meta property="og:image:alt" content="${imageAlt}">`,
            '<meta name="twitter:card" content="summary_large_image">',
            `<meta name="twitter:title" content="${title}">`,
            `<meta name="twitter:description" content="${description}">`,
            `<meta name="twitter:image" content="${imageUrl}">`,
            `<meta name="twitter:image:alt" content="${imageAlt}">`,
          ]
        : []),
    ].join('');
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Miłosz Podsiadły',
      jobTitle: 'Junior Software Developer',
      sameAs: [
        'https://github.com/MiloszPodsiadly',
        'https://www.linkedin.com/in/milosz-podsiadly/',
      ],
      ...(siteOrigin ? { url: `${siteOrigin}/${locale}/` } : {}),
    };
    const jsonLd = `<script type="application/ld+json">${JSON.stringify(structuredData)}</script>`;
    const introduction =
      locale === 'en'
        ? 'An English introduction with enough meaningful content to satisfy the static output contract.'
        : 'Polskie wprowadzenie z wystarczającą treścią, aby spełnić kontrakt statycznego HTML.';
    const portrait = portraitAvailable
      ? '<img class="hero-portrait" src="/assets/portraits/hero-960.webp" srcset="/assets/portraits/hero-480.webp 480w, /assets/portraits/hero-960.webp 960w" alt="Portrait">'
      : '';
    const projectCards = [
      [
        'fraud-detection-platform',
        'Fraud Detection Platform',
        'fraud-signals.svg',
        'fraud-detection-platform',
      ],
      ['stockrescue-ai', 'StockRescue AI', 'stock-rescue.svg', 'StockRescue'],
      ['chess-project', 'Chess Project', 'chess-piece.svg', 'chess-project'],
      ['library', 'Library', 'library.svg', 'Library'],
    ]
      .map(
        ([slug, name, artwork, repository]) =>
          `<article class="project-card"><h3 id="project-card-${slug}">${name}</h3><img src="/assets/projects/${artwork}" alt=""><a href="https://github.com/MiloszPodsiadly/${repository}" target="_blank" rel="noopener noreferrer">Source code</a></article>`,
      )
      .join('');
    const socialLinks =
      '<a href="https://github.com/MiloszPodsiadly" target="_blank" rel="noopener noreferrer">GitHub</a><a href="https://www.linkedin.com/in/milosz-podsiadly/" target="_blank" rel="noopener noreferrer">LinkedIn</a>';
    const about =
      locale === 'en' ? 'About me and backend projects.' : 'O mnie i projektach backendowych.';
    const afterHours = locale === 'en' ? 'After hours' : 'Po godzinach';
    const heroCta =
      '<a href="https://github.com/MiloszPodsiadly" target="_blank" rel="noopener noreferrer">View projects</a>';
    const html = `<html lang="${locale}"><head><title>${title}</title><meta name="theme-color" content="#070D20"><meta name="description" content="${description}"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="icon" type="image/png" sizes="32x32" href="/favicon.png"><link rel="stylesheet" href="/assets/site-abcdef12.css">${socialMetadata}${seo}${jsonLd}<script type="module" src="/assets/client-abcdef12.js"></script></head><body><div id="root" data-portrait-available="${portraitAvailable}">${portrait}<a href="#main-content">Skip</a><nav><a href="/en/">English</a><a href="/pl/">Polski</a></nav><main id="main-content"><h1>Junior Software Developer</h1><p>${introduction}</p>${heroCta}<section id="projects">${projectCards}</section><section id="about"><h2>About</h2><p>${about}</p></section><section id="technologies"><h2>Technologies</h2><p>Java</p></section><section id="after-hours"><h2>${afterHours}</h2></section><section id="social"><h2>Profiles</h2>${socialLinks}</section></main></div></body></html>`;
    await writeFile(join(directory, locale, 'index.html'), html);
  }
}

afterEach(async () => {
  if (fixtureDirectory) await rm(fixtureDirectory, { recursive: true, force: true });
  fixtureDirectory = undefined;
});

describe('built output verification', () => {
  it('fails on missing static routes instead of reporting success', async () => {
    fixtureDirectory = await mkdtemp(join(tmpdir(), 'portfolio-output-fixture-'));
    await mkdir(join(fixtureDirectory, 'en'), { recursive: true });
    await expect(verifyOutput({ distDirectory: fixtureDirectory })).rejects.toThrow(
      'Missing dist/en/index.html.',
    );
  });

  it('fails when a localized static page is missing', async () => {
    fixtureDirectory = await mkdtemp(join(tmpdir(), 'portfolio-output-fixture-'));
    await writeValidFixture(fixtureDirectory, 'https://portfolio.dev');
    await rm(join(fixtureDirectory, 'pl', 'index.html'));

    await expect(
      verifyOutput({ distDirectory: fixtureDirectory, siteUrl: 'https://portfolio.dev' }),
    ).rejects.toThrow('Missing dist/pl/index.html.');
  });

  it('fails when localized pages contain a broken HTML contract', async () => {
    fixtureDirectory = await mkdtemp(join(tmpdir(), 'portfolio-output-fixture-'));
    await writeValidFixture(fixtureDirectory, undefined);
    const englishPath = join(fixtureDirectory, 'en', 'index.html');
    const englishHtml = await readFile(englishPath, 'utf8');
    await writeFile(englishPath, englishHtml.replace('</body>', '<h1>Duplicate</h1></body>'));
    await expect(verifyOutput({ distDirectory: fixtureDirectory })).rejects.toThrow(
      'must have one h1',
    );
  });

  it('accepts conditional canonical and hreflang tags only for a confirmed origin', async () => {
    fixtureDirectory = await mkdtemp(join(tmpdir(), 'portfolio-output-fixture-'));
    await writeValidFixture(fixtureDirectory, 'https://portfolio.dev');
    await expect(
      verifyOutput({ distDirectory: fixtureDirectory, siteUrl: 'https://portfolio.dev' }),
    ).resolves.toMatchObject({ files: 15, siteOrigin: 'https://portfolio.dev' });
  });

  it('rejects a social image with invalid PNG dimensions', async () => {
    fixtureDirectory = await mkdtemp(join(tmpdir(), 'portfolio-output-fixture-'));
    await writeValidFixture(fixtureDirectory, 'https://portfolio.dev');
    const imagePath = join(fixtureDirectory, 'assets', 'og', 'portfolio-cover.png');
    const image = await readFile(imagePath);
    image.writeUInt32BE(1199, 16);
    await writeFile(imagePath, image);

    await expect(
      verifyOutput({ distDirectory: fixtureDirectory, siteUrl: 'https://portfolio.dev' }),
    ).rejects.toThrow('exactly 1200x630 pixels');
  });

  it('rejects an image without a PNG signature', async () => {
    fixtureDirectory = await mkdtemp(join(tmpdir(), 'portfolio-output-fixture-'));
    await writeValidFixture(fixtureDirectory, 'https://portfolio.dev');
    const imagePath = join(fixtureDirectory, 'assets', 'og', 'portfolio-cover.png');
    const image = await readFile(imagePath);
    image[0] = 0;
    await writeFile(imagePath, image);

    await expect(
      verifyOutput({ distDirectory: fixtureDirectory, siteUrl: 'https://portfolio.dev' }),
    ).rejects.toThrow('is not a PNG file');
  });

  it('rejects duplicate social metadata tags', async () => {
    fixtureDirectory = await mkdtemp(join(tmpdir(), 'portfolio-output-fixture-'));
    await writeValidFixture(fixtureDirectory, 'https://portfolio.dev');
    const englishPath = join(fixtureDirectory, 'en', 'index.html');
    const englishHtml = await readFile(englishPath, 'utf8');
    await writeFile(
      englishPath,
      englishHtml.replace('</head>', '<meta property="og:title" content="Duplicate"></head>'),
    );

    await expect(
      verifyOutput({ distDirectory: fixtureDirectory, siteUrl: 'https://portfolio.dev' }),
    ).rejects.toThrow('one consistent localized set of Open Graph tags');
  });

  it('rejects malformed JSON-LD instead of accepting unparsed script data', async () => {
    fixtureDirectory = await mkdtemp(join(tmpdir(), 'portfolio-output-fixture-'));
    await writeValidFixture(fixtureDirectory, 'https://portfolio.dev');
    const englishPath = join(fixtureDirectory, 'en', 'index.html');
    const englishHtml = await readFile(englishPath, 'utf8');
    const malformedHtml = englishHtml.replace(
      /(<script type="application\/ld\+json">)[\s\S]*?(<\/script>)/,
      '$1{"@type":$2',
    );
    await writeFile(englishPath, malformedHtml);

    await expect(
      verifyOutput({ distDirectory: fixtureDirectory, siteUrl: 'https://portfolio.dev' }),
    ).rejects.toThrow('malformed JSON-LD');
  });

  it('rejects missing sitemap URLs and duplicate URLs that drift from canonical pages', async () => {
    fixtureDirectory = await mkdtemp(join(tmpdir(), 'portfolio-output-fixture-'));
    await writeValidFixture(fixtureDirectory, 'https://portfolio.dev');
    const sitemapPath = join(fixtureDirectory, 'sitemap.xml');
    const sitemap = await readFile(sitemapPath, 'utf8');
    await writeFile(
      sitemapPath,
      sitemap.replace('https://portfolio.dev/pl/', 'https://portfolio.dev/en/'),
    );

    await expect(
      verifyOutput({ distDirectory: fixtureDirectory, siteUrl: 'https://portfolio.dev' }),
    ).rejects.toThrow('exactly the two canonical locale URLs');
  });

  it('rejects a missing configured sitemap', async () => {
    fixtureDirectory = await mkdtemp(join(tmpdir(), 'portfolio-output-fixture-'));
    await writeValidFixture(fixtureDirectory, 'https://portfolio.dev');
    await rm(join(fixtureDirectory, 'sitemap.xml'));

    await expect(
      verifyOutput({ distDirectory: fixtureDirectory, siteUrl: 'https://portfolio.dev' }),
    ).rejects.toThrow('Missing dist/sitemap.xml.');
  });

  it('rejects malformed sitemap XML', async () => {
    fixtureDirectory = await mkdtemp(join(tmpdir(), 'portfolio-output-fixture-'));
    await writeValidFixture(fixtureDirectory, 'https://portfolio.dev');
    const sitemapPath = join(fixtureDirectory, 'sitemap.xml');
    const sitemap = await readFile(sitemapPath, 'utf8');
    await writeFile(sitemapPath, sitemap.replace('</urlset>', '<urlset>'));

    await expect(
      verifyOutput({ distDirectory: fixtureDirectory, siteUrl: 'https://portfolio.dev' }),
    ).rejects.toThrow('well-formed UTF-8 XML');
  });

  it('rejects a sitemap when SITE_URL is absent', async () => {
    fixtureDirectory = await mkdtemp(join(tmpdir(), 'portfolio-output-fixture-'));
    await writeValidFixture(fixtureDirectory, undefined);
    await writeFile(join(fixtureDirectory, 'sitemap.xml'), '<urlset></urlset>');

    await expect(verifyOutput({ distDirectory: fixtureDirectory, siteUrl: '' })).rejects.toThrow(
      'must not contain sitemap.xml',
    );
  });

  it('rejects missing or conflicting robots.txt policies', async () => {
    fixtureDirectory = await mkdtemp(join(tmpdir(), 'portfolio-output-fixture-'));
    await writeValidFixture(fixtureDirectory, undefined);
    const robotsPath = join(fixtureDirectory, 'robots.txt');
    await writeFile(robotsPath, 'User-agent: *\nDisallow: /\n');

    await expect(verifyOutput({ distDirectory: fixtureDirectory, siteUrl: '' })).rejects.toThrow(
      'robots.txt must allow crawlers to see page-level noindex',
    );
  });

  it('rejects a missing robots.txt', async () => {
    fixtureDirectory = await mkdtemp(join(tmpdir(), 'portfolio-output-fixture-'));
    await writeValidFixture(fixtureDirectory, undefined);
    await rm(join(fixtureDirectory, 'robots.txt'));

    await expect(verifyOutput({ distDirectory: fixtureDirectory, siteUrl: '' })).rejects.toThrow(
      'Missing dist/robots.txt.',
    );
  });

  it('rejects a 404 page without its shared local stylesheet', async () => {
    fixtureDirectory = await mkdtemp(join(tmpdir(), 'portfolio-output-fixture-'));
    await writeValidFixture(fixtureDirectory, undefined);
    const notFoundPath = join(fixtureDirectory, '404.html');
    const notFoundHtml = await readFile(notFoundPath, 'utf8');
    await writeFile(
      notFoundPath,
      notFoundHtml.replace('<link rel="stylesheet" href="/assets/site-abcdef12.css">', ''),
    );

    await expect(verifyOutput({ distDirectory: fixtureDirectory, siteUrl: '' })).rejects.toThrow(
      '404.html must link to a stylesheet',
    );
  });

  it('rejects duplicate canonical links in configured mode', async () => {
    fixtureDirectory = await mkdtemp(join(tmpdir(), 'portfolio-output-fixture-'));
    await writeValidFixture(fixtureDirectory, 'https://portfolio.dev');
    const englishPath = join(fixtureDirectory, 'en', 'index.html');
    const englishHtml = await readFile(englishPath, 'utf8');
    await writeFile(
      englishPath,
      englishHtml.replace(
        '</head>',
        '<link rel="canonical" href="https://portfolio.dev/en/"></head>',
      ),
    );

    await expect(
      verifyOutput({ distDirectory: fixtureDirectory, siteUrl: 'https://portfolio.dev' }),
    ).rejects.toThrow('must have exactly one canonical link');
  });

  it('rejects a missing reciprocal hreflang entry', async () => {
    fixtureDirectory = await mkdtemp(join(tmpdir(), 'portfolio-output-fixture-'));
    await writeValidFixture(fixtureDirectory, 'https://portfolio.dev');
    const englishPath = join(fixtureDirectory, 'en', 'index.html');
    const englishHtml = await readFile(englishPath, 'utf8');
    await writeFile(
      englishPath,
      englishHtml.replace(
        '<link rel="alternate" hreflang="pl" href="https://portfolio.dev/pl/">',
        '',
      ),
    );

    await expect(
      verifyOutput({ distDirectory: fixtureDirectory, siteUrl: 'https://portfolio.dev' }),
    ).rejects.toThrow('reciprocal en/pl/x-default hreflang set');
  });

  it('rejects an incorrect x-default locale target', async () => {
    fixtureDirectory = await mkdtemp(join(tmpdir(), 'portfolio-output-fixture-'));
    await writeValidFixture(fixtureDirectory, 'https://portfolio.dev');
    const polishPath = join(fixtureDirectory, 'pl', 'index.html');
    const polishHtml = await readFile(polishPath, 'utf8');
    await writeFile(
      polishPath,
      polishHtml.replace(
        'hreflang="x-default" href="https://portfolio.dev/en/"',
        'hreflang="x-default" href="https://portfolio.dev/pl/"',
      ),
    );

    await expect(
      verifyOutput({ distDirectory: fixtureDirectory, siteUrl: 'https://portfolio.dev' }),
    ).rejects.toThrow('reciprocal en/pl/x-default hreflang set');
  });

  it('rejects an invalid configured SITE_URL', async () => {
    fixtureDirectory = await mkdtemp(join(tmpdir(), 'portfolio-output-fixture-'));
    await writeValidFixture(fixtureDirectory, 'https://portfolio.dev');

    await expect(
      verifyOutput({ distDirectory: fixtureDirectory, siteUrl: 'http://portfolio.dev' }),
    ).rejects.toThrow('SITE_URL must be an absolute HTTPS origin');
  });

  it('rejects a missing favicon asset referenced by localized pages', async () => {
    fixtureDirectory = await mkdtemp(join(tmpdir(), 'portfolio-output-fixture-'));
    await writeValidFixture(fixtureDirectory, undefined);
    await rm(join(fixtureDirectory, 'favicon.png'));

    await expect(verifyOutput({ distDirectory: fixtureDirectory, siteUrl: '' })).rejects.toThrow(
      'Missing dist/favicon.png.',
    );
  });

  it('rejects a favicon SVG with an external resource', async () => {
    fixtureDirectory = await mkdtemp(join(tmpdir(), 'portfolio-output-fixture-'));
    await writeValidFixture(fixtureDirectory, undefined);
    await writeFile(
      join(fixtureDirectory, 'favicon.svg'),
      '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><image href="https://example.net/icon.png" /></svg>',
    );

    await expect(verifyOutput({ distDirectory: fixtureDirectory, siteUrl: '' })).rejects.toThrow(
      'favicon.svg must not reference external content',
    );
  });

  it('rejects a missing social preview PNG', async () => {
    fixtureDirectory = await mkdtemp(join(tmpdir(), 'portfolio-output-fixture-'));
    await writeValidFixture(fixtureDirectory, 'https://portfolio.dev');
    await rm(join(fixtureDirectory, 'assets', 'og', 'portfolio-cover.png'));

    await expect(
      verifyOutput({ distDirectory: fixtureDirectory, siteUrl: 'https://portfolio.dev' }),
    ).rejects.toThrow('Missing dist/assets/og/portfolio-cover.png.');
  });

  it('rejects a sitemap host that differs from page canonicals', async () => {
    fixtureDirectory = await mkdtemp(join(tmpdir(), 'portfolio-output-fixture-'));
    await writeValidFixture(fixtureDirectory, 'https://portfolio.dev');
    const sitemapPath = join(fixtureDirectory, 'sitemap.xml');
    const sitemap = await readFile(sitemapPath, 'utf8');
    await writeFile(sitemapPath, sitemap.replaceAll('portfolio.dev', 'preview.portfolio.dev'));

    await expect(
      verifyOutput({ distDirectory: fixtureDirectory, siteUrl: 'https://portfolio.dev' }),
    ).rejects.toThrow('exactly the two canonical locale URLs');
  });

  it('rejects a JSON-LD payload that closes its script element', async () => {
    fixtureDirectory = await mkdtemp(join(tmpdir(), 'portfolio-output-fixture-'));
    await writeValidFixture(fixtureDirectory, 'https://portfolio.dev');
    const englishPath = join(fixtureDirectory, 'en', 'index.html');
    const englishHtml = await readFile(englishPath, 'utf8');
    const unsafeHtml = englishHtml.replace(
      /(<script type="application\/ld\+json">)[\s\S]*?(<\/script>)/,
      '$1{"name":"</script><script>alert(1)</script>"}$2',
    );
    await writeFile(englishPath, unsafeHtml);

    await expect(
      verifyOutput({ distDirectory: fixtureDirectory, siteUrl: 'https://portfolio.dev' }),
    ).rejects.toThrow('must contain one data script and one client module');
  });

  it('rejects absolute-dependent links when SITE_URL is absent', async () => {
    fixtureDirectory = await mkdtemp(join(tmpdir(), 'portfolio-output-fixture-'));
    await writeValidFixture(fixtureDirectory, undefined);
    const polishPath = join(fixtureDirectory, 'pl', 'index.html');
    const polishHtml = await readFile(polishPath, 'utf8');
    await writeFile(
      polishPath,
      polishHtml.replace(
        '</head>',
        '<link rel="canonical" href="https://portfolio.dev/pl/"></head>',
      ),
    );

    await expect(verifyOutput({ distDirectory: fixtureDirectory, siteUrl: '' })).rejects.toThrow(
      'must omit canonical links without SITE_URL',
    );
  });

  it('requires noindex when SITE_URL is absent', async () => {
    fixtureDirectory = await mkdtemp(join(tmpdir(), 'portfolio-output-fixture-'));
    await writeValidFixture(fixtureDirectory, undefined);
    const polishPath = join(fixtureDirectory, 'pl', 'index.html');
    const polishHtml = await readFile(polishPath, 'utf8');
    await writeFile(
      polishPath,
      polishHtml.replace('<meta name="robots" content="noindex, nofollow">', ''),
    );

    await expect(verifyOutput({ distDirectory: fixtureDirectory, siteUrl: '' })).rejects.toThrow(
      'must have one robots meta tag without SITE_URL',
    );
  });

  it('accepts both optimized portrait exports when the prerendered page enables the portrait', async () => {
    fixtureDirectory = await mkdtemp(join(tmpdir(), 'portfolio-output-fixture-'));
    await writeValidFixture(fixtureDirectory, undefined, true);

    await expect(
      verifyOutput({ distDirectory: fixtureDirectory, siteUrl: '' }),
    ).resolves.toMatchObject({
      files: 16,
    });
  });

  it('fails when a production page theme-color differs from the development template', async () => {
    fixtureDirectory = await mkdtemp(join(tmpdir(), 'portfolio-output-fixture-'));
    await writeValidFixture(fixtureDirectory, undefined, true);
    const polishPath = join(fixtureDirectory, 'pl', 'index.html');
    const polishHtml = await readFile(polishPath, 'utf8');
    await writeFile(polishPath, polishHtml.replace('#070D20', '#FF5BA7'));

    await expect(verifyOutput({ distDirectory: fixtureDirectory, siteUrl: '' })).rejects.toThrow(
      'pl/index.html theme-color must match index.html.',
    );
  });
});
