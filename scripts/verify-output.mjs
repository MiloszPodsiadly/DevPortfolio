import assert from 'node:assert/strict';
import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { validateSiteOrigin } from '../src/lib/site-url.mjs';

const defaultDist = resolve(process.cwd(), 'dist');
const placeholderPattern =
  /(^|\.)(example|test|invalid|localhost|local)(\.|$)|your[-.]?domain|placeholder/i;

function htmlText(html) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(?:nbsp|amp|lt|gt|quot|#39);/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function attributeValues(html, name) {
  return [...html.matchAll(new RegExp(`\\b${name}=["']([^"']*)["']`, 'gi'))].map(
    (match) => match[1],
  );
}

function themeColor(html, filename) {
  const meta = html.match(/<meta\b(?=[^>]*\bname=["']theme-color["'])[^>]*>/i)?.[0];
  assert.ok(meta, `${filename} is missing its theme-color meta tag.`);
  const color = attributeValues(meta, 'content')[0];
  assert.match(color ?? '', /^#[\da-f]{6}$/i, `${filename} has an invalid theme-color.`);
  return color.toUpperCase();
}

async function allFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const paths = await Promise.all(
    entries.map((entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? allFiles(path) : [path];
    }),
  );
  return paths.flat();
}

function checkLinks(html, filename, filesByRelativePath) {
  const hrefs = attributeValues(html, 'href');
  assert.ok(hrefs.length > 0, `${filename} should contain useful links.`);
  for (const href of hrefs) {
    assert.ok(href.trim() !== '' && href !== '#', `${filename} has an empty or placeholder href.`);
    assert.ok(!/^javascript:/i.test(href), `${filename} contains a javascript: href.`);
    assert.ok(!placeholderPattern.test(href), `${filename} contains a placeholder URL.`);
    if (href.startsWith('#')) {
      assert.ok(
        new RegExp(`\\bid=["']${href.slice(1)}["']`).test(html),
        `${filename} has a broken anchor: ${href}`,
      );
    }
    if (href.startsWith('/assets/')) {
      assert.ok(
        filesByRelativePath.has(href.slice(1)),
        `${filename} references missing asset ${href}.`,
      );
    }
  }
  const newTabAnchors = [...html.matchAll(/<a\b[^>]*\btarget=["']_blank["'][^>]*>/gi)].map(
    (match) => match[0],
  );
  for (const anchor of newTabAnchors) {
    const rel = attributeValues(anchor, 'rel')[0]?.split(/\s+/) ?? [];
    assert.ok(
      rel.includes('noopener') && rel.includes('noreferrer'),
      `${filename} has a new-tab link without noopener noreferrer.`,
    );
  }
}

export async function verifyOutput({
  distDirectory = defaultDist,
  sourceIndexPath = resolve(process.cwd(), 'index.html'),
  siteUrl = process.env.SITE_URL,
} = {}) {
  const resolvedDist = resolve(distDirectory);
  const files = await allFiles(resolvedDist);
  const filePaths = new Set(
    files.map((file) => relative(resolvedDist, file).replaceAll('\\', '/')),
  );
  const portraitExports = ['assets/portraits/hero-480.webp', 'assets/portraits/hero-960.webp'];
  const portraitExportStates = portraitExports.map((path) => filePaths.has(path));
  assert.ok(
    portraitExportStates.every((exists) => exists === portraitExportStates[0]),
    'The build must include both portrait exports or neither one.',
  );
  const portraitAvailable = portraitExportStates.every(Boolean);
  for (const required of ['en/index.html', 'pl/index.html', '404.html', '_redirects']) {
    assert.ok(filePaths.has(required), `Missing dist/${required}.`);
  }
  const devIndex = await readFile(sourceIndexPath, 'utf8');
  const expectedThemeColor = themeColor(devIndex, 'index.html');
  assert.equal(expectedThemeColor, '#070D20', 'The design system theme-color must be #070D20.');
  assert.ok(!filePaths.has('index.html'), 'The build must not emit a root SPA fallback page.');
  assert.ok(
    ![...filePaths].some((path) =>
      /(^|\/)(\.vite|\.ssr-build[^/]*|ssr)(\/|$)|entry-server|manifest\.json$|\.map$/i.test(path),
    ),
    'Server or build-only artifacts leaked into dist/.',
  );
  assert.ok(
    ![...filePaths].some((path) => path.startsWith('.env')),
    'An environment file leaked into dist/.',
  );
  assert.ok(
    ![...filePaths].some(
      (path) => path.startsWith('assets-source/') || /hero-source\.(png|jpe?g|webp)$/i.test(path),
    ),
    'The private portrait source leaked into dist/.',
  );

  const redirects = await readFile(join(resolvedDist, '_redirects'), 'utf8');
  assert.match(
    redirects.trim(),
    /^\/ \/en\/ 302$/,
    'Cloudflare root redirect must be exactly `/ /en/ 302`.',
  );
  const htmlPages = {};
  for (const locale of ['en', 'pl']) {
    const filename = `${locale}/index.html`;
    const html = await readFile(join(resolvedDist, filename), 'utf8');
    htmlPages[locale] = html;
    assert.equal(
      themeColor(html, filename),
      expectedThemeColor,
      `${filename} theme-color must match index.html.`,
    );
    assert.match(
      html,
      new RegExp(`<html\\b[^>]*\\blang=["']${locale}["']`, 'i'),
      `${filename} has the wrong language.`,
    );
    assert.equal((html.match(/<h1\b/gi) ?? []).length, 1, `${filename} must have one h1.`);
    assert.match(html, /<title>[^<]+<\/title>/i, `${filename} is missing a title.`);
    assert.match(
      html,
      /<meta\s+name=["']description["']\s+content=["'][^"']+["']\s*\/?\s*>/i,
      `${filename} is missing a description.`,
    );
    assert.match(
      htmlText(html),
      /Junior Software Developer/,
      `${filename} is missing the approved role label.`,
    );
    assert.ok(
      htmlText(html).length > 80,
      `${filename} does not contain meaningful prerendered content.`,
    );
    const expectedProjectSlugs = ['fraud-detection-platform', 'stockrescue-ai', 'chess-project'];
    const renderedProjectSlugs = [...html.matchAll(/\bid=["']project-card-([a-z0-9-]+)["']/gi)].map(
      (match) => match[1],
    );
    assert.deepEqual(
      renderedProjectSlugs,
      expectedProjectSlugs,
      `${filename} must contain the same three project cards in the required order.`,
    );
    for (const section of ['projects', 'about', 'technologies', 'after-hours', 'social']) {
      assert.ok(
        attributeValues(html, 'id').includes(section),
        `${filename} is missing #${section}.`,
      );
    }
    assert.match(htmlText(html), locale === 'en' ? /After hours/ : /Po godzinach/);
    for (const repository of [
      'https://github.com/MiloszPodsiadly/fraud-detection-platform',
      'https://github.com/MiloszPodsiadly/StockRescue',
      'https://github.com/MiloszPodsiadly/chess-project',
    ]) {
      assert.equal(
        attributeValues(html, 'href').filter((href) => href === repository).length,
        1,
        `${filename} must include exactly one source link for ${repository}.`,
      );
    }
    assert.ok(
      attributeValues(html, 'href').includes('https://github.com/MiloszPodsiadly'),
      `${filename} is missing the GitHub profile link.`,
    );
    assert.ok(
      attributeValues(html, 'href').includes('https://www.linkedin.com/in/milosz-podsiadly/'),
      `${filename} is missing the owner-approved LinkedIn link.`,
    );
    const newTabLinks = [...html.matchAll(/<a\b[^>]*\btarget=["']_blank["'][^>]*>/gi)];
    assert.equal(
      newTabLinks.length,
      5,
      `${filename} must render three repository and two profile links.`,
    );
    assert.ok(
      !attributeValues(html, 'href').some((href) => href.startsWith('mailto:')),
      `${filename} contains an unapproved email link.`,
    );
    assert.doesNotMatch(
      html,
      /HopOn Netherlands/i,
      `${filename} contains excluded project content.`,
    );
    assert.doesNotMatch(
      html,
      placeholderPattern,
      `${filename} contains a placeholder production domain.`,
    );
    assert.ok(
      html.includes(`data-portrait-available="${portraitAvailable}"`),
      `${filename} has a portrait availability flag inconsistent with the built assets.`,
    );
    if (portraitAvailable) {
      assert.ok(
        attributeValues(html, 'src').includes('/assets/portraits/hero-960.webp'),
        `${filename} is missing the high-resolution portrait source.`,
      );
      assert.ok(
        attributeValues(html, 'srcset').some((value) =>
          value.includes('/assets/portraits/hero-480.webp 480w'),
        ),
        `${filename} is missing the responsive portrait source set.`,
      );
      assert.ok(
        attributeValues(html, 'alt').some((value) => value.trim().length > 0),
        `${filename} portrait must have localized alternative text.`,
      );
    } else {
      assert.doesNotMatch(
        html,
        /class=["']hero-portrait["']/i,
        `${filename} should use the scene fallback.`,
      );
    }
    checkLinks(html, filename, filePaths);

    const projectArtworkSources = attributeValues(html, 'src').filter((src) =>
      src.startsWith('/assets/projects/'),
    );
    assert.equal(
      projectArtworkSources.length,
      3,
      `${filename} must include three local project illustrations.`,
    );
    for (const source of projectArtworkSources) {
      assert.ok(
        filePaths.has(source.slice(1)),
        `${filename} references missing project artwork ${source}.`,
      );
    }

    const scriptSources = attributeValues(html, 'src');
    assert.ok(
      scriptSources.some((src) => /^\/assets\/[\w-]+-[\w-]{6,}\.js$/.test(src)),
      `${filename} is missing a hashed local client script.`,
    );
    for (const src of scriptSources) {
      assert.ok(
        src.startsWith('/assets/'),
        `${filename} references a remote or unexpected script: ${src}`,
      );
      assert.ok(filePaths.has(src.slice(1)), `${filename} references missing script ${src}.`);
    }
    const stylesheets = [
      ...html.matchAll(/<link\b[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["']/gi),
    ].map((match) => match[1]);
    assert.ok(stylesheets.length > 0, `${filename} is missing its local stylesheet.`);
    for (const href of stylesheets) {
      assert.ok(href.startsWith('/assets/'), `${filename} references a remote stylesheet: ${href}`);
      assert.ok(filePaths.has(href.slice(1)), `${filename} references missing stylesheet ${href}.`);
    }

    if (siteUrl) {
      const siteOrigin = validateSiteOrigin(siteUrl);
      assert.match(
        html,
        new RegExp(`<link rel=["']canonical["'] href=["']${siteOrigin}/${locale}/["']`),
      );
      for (const language of ['en', 'pl']) {
        assert.match(
          html,
          new RegExp(`hreflang=["']${language}["'] href=["']${siteOrigin}/${language}/["']`),
        );
      }
      assert.match(html, new RegExp(`hreflang=["']x-default["'] href=["']${siteOrigin}/en/["']`));
    } else {
      assert.doesNotMatch(
        html,
        /rel=["']canonical["']|hreflang=/i,
        `${filename} should not publish unconfirmed SEO URLs.`,
      );
    }
  }

  assert.notEqual(
    htmlText(htmlPages.en),
    htmlText(htmlPages.pl),
    'English and Polish output must contain distinct content.',
  );
  const notFound = await readFile(join(resolvedDist, '404.html'), 'utf8');
  assert.equal(
    themeColor(notFound, '404.html'),
    expectedThemeColor,
    '404.html theme-color must match index.html.',
  );
  assert.match(notFound, /<h1\b[^>]*>[^<]+<\/h1>/i, '404.html must contain a useful heading.');
  assert.match(notFound, /href=["']\/en\/["']/i, '404.html must link to English.');
  assert.match(notFound, /href=["']\/pl\/["']/i, '404.html must link to Polish.');
  checkLinks(notFound, '404.html', filePaths);

  const allText = await Promise.all(
    files
      .filter((file) => /\.(html|css|js|svg|txt)$/i.test(file))
      .map((file) => readFile(file, 'utf8')),
  );
  assert.ok(
    !allText.some((text) => /HopOn Netherlands/i.test(text)),
    'Excluded project content leaked into dist/.',
  );
  assert.ok(
    !allText.some((text) =>
      /<script\b[^>]*\bsrc=["']https?:|<link\b[^>]*rel=["']stylesheet["'][^>]*href=["']https?:|<img\b[^>]*\bsrc=["']https?:|<source\b[^>]*\bsrcset=["']https?:|@import\s+(?:url\()?\s*["']?https?:|url\(\s*["']?https?:|fonts\.googleapis\.com|googletagmanager|google-analytics/i.test(
        text,
      ),
    ),
    'An external script, font, or tracker dependency leaked into dist/.',
  );

  const bytes = await Promise.all(files.map(async (file) => (await stat(file)).size));
  return { files: filePaths.size, bytes: bytes.reduce((total, size) => total + size, 0) };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const result = await verifyOutput();
    console.log(`Output verified: ${result.files} files, ${result.bytes} bytes.`);
    if (!process.env.SITE_URL) {
      console.log('SITE_URL is unset; canonical and hreflang tags remain a PF-004 release gate.');
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
