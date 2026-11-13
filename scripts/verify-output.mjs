import assert from 'node:assert/strict';
import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { JSDOM } from 'jsdom';
import { validateSiteOrigin } from '../src/lib/site-url.mjs';

const defaultDist = resolve(process.env.PORTFOLIO_DIST_DIR ?? join(process.cwd(), 'dist'));
const placeholderPattern =
  /(^|\.)(example|test|invalid|localhost|local)(\.|$)|your[-.]?domain|placeholder/i;

const parsedDocuments = new Map();

function htmlDocument(html) {
  let document = parsedDocuments.get(html);
  if (!document) {
    document = new JSDOM(html).window.document;
    if (parsedDocuments.size >= 32) parsedDocuments.clear();
    parsedDocuments.set(html, document);
  }
  return document;
}

function htmlText(html) {
  return htmlDocument(html).body.textContent.replace(/\s+/g, ' ').trim();
}

function attributeValues(html, name) {
  return [...htmlDocument(html).querySelectorAll(`[${name}]`)].map((element) =>
    element.getAttribute(name),
  );
}

function tagsWithAttribute(html, tagName, attributeName, expectedValue) {
  return [...htmlDocument(html).querySelectorAll(tagName)].filter(
    (element) => element.getAttribute(attributeName)?.toLowerCase() === expectedValue.toLowerCase(),
  );
}

function tagAttribute(tag, attributeName) {
  return tag.getAttribute(attributeName) ?? undefined;
}

function tagsWithAttributePrefix(html, tagName, attributeName, prefix) {
  return [...htmlDocument(html).querySelectorAll(tagName)].filter((element) =>
    tagAttribute(element, attributeName)?.startsWith(prefix),
  );
}

function personJsonLd(html, filename, locale, siteOrigin) {
  const scripts = [...htmlDocument(html).querySelectorAll('script')].filter(
    (script) => script.getAttribute('type')?.toLowerCase() === 'application/ld+json',
  );
  assert.equal(scripts.length, 1, `${filename} must contain exactly one JSON-LD Person script.`);
  assert.equal(
    scripts[0].hasAttribute('src'),
    false,
    `${filename} JSON-LD must contain data only.`,
  );

  let person;
  try {
    person = JSON.parse(scripts[0].textContent);
  } catch {
    assert.fail(`${filename} contains malformed JSON-LD.`);
  }

  const expected = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Miłosz Podsiadły',
    jobTitle: 'Junior Software Developer',
    sameAs: ['https://github.com/MiloszPodsiadly', 'https://www.linkedin.com/in/milosz-podsiadly/'],
    ...(siteOrigin ? { url: `${siteOrigin}/${locale}/` } : {}),
  };
  assert.deepEqual(
    person,
    expected,
    `${filename} JSON-LD must contain only the approved Person facts and its matching locale URL.`,
  );
  return person;
}

function pngDimensions(image, filename) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  assert.ok(image.subarray(0, 8).equals(signature), `${filename} is not a PNG file.`);

  let offset = 8;
  let dimensions;
  let hasImageData = false;
  let hasEnd = false;
  while (offset < image.length) {
    assert.ok(image.length - offset >= 12, `${filename} has a truncated PNG chunk.`);
    const chunkLength = image.readUInt32BE(offset);
    const chunkType = image.toString('ascii', offset + 4, offset + 8);
    const chunkEnd = offset + 12 + chunkLength;
    assert.ok(chunkEnd <= image.length, `${filename} has a truncated PNG chunk.`);
    if (offset === 8) {
      assert.equal(chunkType, 'IHDR', `${filename} must start with an IHDR chunk.`);
      assert.equal(chunkLength, 13, `${filename} has an invalid IHDR chunk.`);
      dimensions = {
        width: image.readUInt32BE(offset + 8),
        height: image.readUInt32BE(offset + 12),
      };
    }
    if (chunkType === 'IDAT') hasImageData = true;
    if (chunkType === 'IEND') {
      assert.equal(chunkLength, 0, `${filename} has an invalid IEND chunk.`);
      hasEnd = true;
      offset = chunkEnd;
      break;
    }
    offset = chunkEnd;
  }

  assert.ok(
    dimensions && hasImageData && hasEnd && offset === image.length,
    `${filename} is malformed.`,
  );
  return dimensions;
}

function verifyFaviconSvg(source) {
  let document;
  try {
    document = new JSDOM(source, { contentType: 'image/svg+xml' }).window.document;
  } catch {
    assert.fail('favicon.svg must be well-formed XML.');
  }
  const root = document.documentElement;
  assert.equal(root.localName, 'svg', 'favicon.svg must have an SVG root element.');
  assert.equal(
    root.namespaceURI,
    'http://www.w3.org/2000/svg',
    'favicon.svg must use the SVG namespace.',
  );
  assert.equal(root.getAttribute('width'), '64', 'favicon.svg must be 64 pixels wide.');
  assert.equal(root.getAttribute('height'), '64', 'favicon.svg must be 64 pixels tall.');
  assert.equal(root.getAttribute('viewBox'), '0 0 64 64', 'favicon.svg has an invalid viewBox.');
  assert.equal(document.querySelectorAll('script, foreignObject').length, 0);
  assert.doesNotMatch(
    source,
    /url\(\s*["']?(?:https?:|\/\/|data:)/i,
    'favicon.svg must not reference an external CSS resource.',
  );
  for (const element of document.querySelectorAll('*')) {
    for (const attribute of ['href', 'xlink:href']) {
      const value = element.getAttribute(attribute);
      assert.ok(
        value === null || value.startsWith('#'),
        `favicon.svg must not reference external content: ${value}`,
      );
    }
  }
  assert.ok(
    [...document.querySelectorAll('rect')].some(
      (rectangle) => rectangle.getAttribute('fill')?.toUpperCase() === '#070D20',
    ),
    'favicon.svg must include the Blue/Violet Nightfall dark tile for contrast.',
  );
  const stops = [...document.querySelectorAll('stop')].map((stop) =>
    stop.getAttribute('stop-color')?.toUpperCase(),
  );
  assert.ok(stops.includes('#4E8CFF') && stops.includes('#9568F9'));
}

function verifyFaviconLinks(html, filename, filePaths) {
  const icons = [...htmlDocument(html).querySelectorAll('link[rel]')].filter((link) =>
    link.rel.split(/\s+/).includes('icon'),
  );
  assert.equal(icons.length, 2, `${filename} must have exactly two favicon links.`);
  assert.deepEqual(
    icons.map((icon) => [icon.getAttribute('type'), icon.getAttribute('href')]),
    [
      ['image/svg+xml', '/favicon.svg'],
      ['image/png', '/favicon.png'],
    ],
    `${filename} must use only the local SVG and PNG favicon files.`,
  );
  for (const icon of icons) {
    const href = icon.getAttribute('href');
    assert.ok(filePaths.has(href.slice(1)), `${filename} references missing favicon ${href}.`);
  }
}

function themeColor(html, filename) {
  const metas = tagsWithAttribute(html, 'meta', 'name', 'theme-color');
  assert.equal(metas.length, 1, `${filename} must have exactly one theme-color meta tag.`);
  const color = tagAttribute(metas[0], 'content');
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
  const document = htmlDocument(html);
  const hrefs = attributeValues(html, 'href');
  assert.ok(hrefs.length > 0, `${filename} should contain useful links.`);
  for (const href of hrefs) {
    assert.ok(href.trim() !== '' && href !== '#', `${filename} has an empty or placeholder href.`);
    assert.ok(!/^javascript:/i.test(href), `${filename} contains a javascript: href.`);
    assert.ok(!placeholderPattern.test(href), `${filename} contains a placeholder URL.`);
    if (href.startsWith('#')) {
      assert.ok(document.getElementById(href.slice(1)), `${filename} has a broken anchor: ${href}`);
    }
    if (href.startsWith('/assets/')) {
      assert.ok(
        filesByRelativePath.has(href.slice(1)),
        `${filename} references missing asset ${href}.`,
      );
    }
  }
  const newTabAnchors = [...document.querySelectorAll('a[target="_blank"]')];
  for (const anchor of newTabAnchors) {
    const rel = anchor.getAttribute('rel')?.split(/\s+/) ?? [];
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
  const siteOrigin = validateSiteOrigin(siteUrl);
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
  for (const required of [
    'en/index.html',
    'pl/index.html',
    '404.html',
    '_redirects',
    'robots.txt',
    'assets/og/portfolio-cover.png',
    'favicon.svg',
    'favicon.png',
  ]) {
    assert.ok(filePaths.has(required), `Missing dist/${required}.`);
  }
  const socialImage = await readFile(join(resolvedDist, 'assets/og/portfolio-cover.png'));
  const socialImageDimensions = pngDimensions(socialImage, 'assets/og/portfolio-cover.png');
  assert.deepEqual(
    socialImageDimensions,
    { width: 1200, height: 630 },
    'The social preview image must be exactly 1200x630 pixels.',
  );
  assert.ok(socialImage.length < 500_000, 'The social preview PNG must remain under 500 KB.');
  const faviconSvg = await readFile(join(resolvedDist, 'favicon.svg'), 'utf8');
  verifyFaviconSvg(faviconSvg);
  const faviconPng = await readFile(join(resolvedDist, 'favicon.png'));
  assert.deepEqual(pngDimensions(faviconPng, 'favicon.png'), { width: 32, height: 32 });
  if (siteOrigin) {
    assert.ok(filePaths.has('sitemap.xml'), 'Missing dist/sitemap.xml.');
  } else {
    assert.ok(!filePaths.has('sitemap.xml'), 'Unconfigured output must not contain sitemap.xml.');
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
  const robots = await readFile(join(resolvedDist, 'robots.txt'), 'utf8');
  const expectedRobots = `User-agent: *\nAllow: /\n${siteOrigin ? `Sitemap: ${siteOrigin}/sitemap.xml\n` : ''}`;
  assert.equal(
    robots,
    expectedRobots,
    'robots.txt must allow crawlers to see page-level noindex and reference only the configured sitemap.',
  );
  if (siteOrigin) {
    const sitemap = await readFile(join(resolvedDist, 'sitemap.xml'), 'utf8');
    let sitemapDocument;
    try {
      sitemapDocument = new JSDOM(sitemap, { contentType: 'text/xml' }).window.document;
    } catch {
      assert.fail('sitemap.xml must be well-formed UTF-8 XML with exactly two URL entries.');
    }
    assert.equal(
      sitemapDocument.documentElement.localName,
      'urlset',
      'sitemap.xml must have a urlset document element.',
    );
    assert.equal(
      sitemapDocument.documentElement.namespaceURI,
      'http://www.sitemaps.org/schemas/sitemap/0.9',
      'sitemap.xml must use the sitemap namespace.',
    );
    const urlEntries = [...sitemapDocument.getElementsByTagNameNS('*', 'url')];
    assert.equal(urlEntries.length, 2, 'sitemap.xml must contain exactly two url entries.');
    assert.ok(
      urlEntries.every((entry) => entry.getElementsByTagNameNS('*', 'loc').length === 1),
      'Each sitemap URL entry must contain exactly one loc element.',
    );
    const locations = [...sitemapDocument.getElementsByTagNameNS('*', 'loc')].map((element) =>
      element.textContent.trim(),
    );
    assert.deepEqual(
      locations,
      [`${siteOrigin}/en/`, `${siteOrigin}/pl/`],
      'sitemap.xml must contain exactly the two canonical locale URLs in order.',
    );
  }
  const htmlPages = {};
  for (const locale of ['en', 'pl']) {
    const filename = `${locale}/index.html`;
    const html = await readFile(join(resolvedDist, filename), 'utf8');
    const document = htmlDocument(html);
    htmlPages[locale] = html;
    assert.equal(
      themeColor(html, filename),
      expectedThemeColor,
      `${filename} theme-color must match index.html.`,
    );
    assert.equal(document.documentElement.lang, locale, `${filename} has the wrong language.`);
    assert.equal(document.querySelectorAll('h1').length, 1, `${filename} must have one h1.`);
    const titles = [...document.querySelectorAll('title')];
    assert.equal(titles.length, 1, `${filename} must have exactly one title.`);
    const descriptions = tagsWithAttribute(html, 'meta', 'name', 'description');
    assert.equal(descriptions.length, 1, `${filename} must have exactly one description.`);
    assert.ok(titles[0].textContent.trim(), `${filename} must have a non-empty title.`);
    assert.ok(tagAttribute(descriptions[0], 'content')?.trim(), `${filename} needs a description.`);
    verifyFaviconLinks(html, filename, filePaths);
    assert.match(
      htmlText(html),
      /Junior Software Developer/,
      `${filename} is missing the approved role label.`,
    );
    assert.ok(
      htmlText(html).length > 80,
      `${filename} does not contain meaningful prerendered content.`,
    );
    const expectedProjectSlugs = [
      'fraud-detection-platform',
      'stockrescue-ai',
      'chess-project',
      'library',
    ];
    const renderedProjectSlugs = [...html.matchAll(/\bid=["']project-card-([a-z0-9-]+)["']/gi)].map(
      (match) => match[1],
    );
    assert.deepEqual(
      renderedProjectSlugs,
      expectedProjectSlugs,
      `${filename} must contain the same four project cards in the required order.`,
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
      'https://github.com/MiloszPodsiadly/Library',
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
      7,
      `${filename} must render four repository links, two social links and the GitHub hero CTA.`,
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
      4,
      `${filename} must include four local project illustrations.`,
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
    const scriptElements = [...document.querySelectorAll('script')];
    assert.equal(
      scriptElements.length,
      2,
      `${filename} must contain one data script and one client module.`,
    );
    assert.equal(
      scriptElements.filter((script) => script.type === 'application/ld+json').length,
      1,
      `${filename} must contain exactly one JSON-LD data script.`,
    );
    assert.equal(
      scriptElements.filter((script) => script.type === 'module' && script.hasAttribute('src'))
        .length,
      1,
      `${filename} must contain one external local client module.`,
    );
    const stylesheets = [...document.querySelectorAll('link[rel~="stylesheet"][href]')].map(
      (link) => link.getAttribute('href'),
    );
    assert.ok(stylesheets.length > 0, `${filename} is missing its local stylesheet.`);
    for (const href of stylesheets) {
      assert.ok(href.startsWith('/assets/'), `${filename} references a remote stylesheet: ${href}`);
      assert.ok(filePaths.has(href.slice(1)), `${filename} references missing stylesheet ${href}.`);
    }

    const canonicalTags = tagsWithAttribute(html, 'link', 'rel', 'canonical');
    const alternateTags = tagsWithAttribute(html, 'link', 'rel', 'alternate');
    const robotsTags = tagsWithAttribute(html, 'meta', 'name', 'robots');
    const pageTitle = titles[0].textContent;
    const descriptionTag = tagsWithAttribute(html, 'meta', 'name', 'description')[0];
    const pageDescription = descriptionTag ? tagAttribute(descriptionTag, 'content') : undefined;
    const imageAlt =
      locale === 'en'
        ? 'Blue and violet portfolio cover for Miłosz Podsiadły, Junior Software Developer'
        : 'Niebiesko-fioletowa okładka portfolio Miłosza Podsiadłego — Junior Software Developer';
    const expectedOg = [
      ['og:type', 'website'],
      ['og:locale', locale === 'en' ? 'en_US' : 'pl_PL'],
      ['og:title', pageTitle],
      ['og:description', pageDescription],
      ['og:site_name', 'Miłosz Podsiadły'],
    ];
    const expectedTwitter = [];
    if (siteOrigin) {
      const imageUrl = `${siteOrigin}/assets/og/portfolio-cover.png`;
      expectedOg.push(
        ['og:url', `${siteOrigin}/${locale}/`],
        ['og:image', imageUrl],
        ['og:image:width', '1200'],
        ['og:image:height', '630'],
        ['og:image:alt', imageAlt],
      );
      expectedTwitter.push(
        ['twitter:card', 'summary_large_image'],
        ['twitter:title', pageTitle],
        ['twitter:description', pageDescription],
        ['twitter:image', imageUrl],
        ['twitter:image:alt', imageAlt],
      );
    }
    const actualOg = tagsWithAttributePrefix(html, 'meta', 'property', 'og:')
      .map((tag) => [tagAttribute(tag, 'property'), tagAttribute(tag, 'content')])
      .sort(([leftProperty], [rightProperty]) => leftProperty.localeCompare(rightProperty));
    const actualTwitter = tagsWithAttributePrefix(html, 'meta', 'name', 'twitter:')
      .map((tag) => [tagAttribute(tag, 'name'), tagAttribute(tag, 'content')])
      .sort(([leftName], [rightName]) => leftName.localeCompare(rightName));
    assert.deepEqual(
      actualOg,
      expectedOg.sort(([leftProperty], [rightProperty]) =>
        leftProperty.localeCompare(rightProperty),
      ),
      `${filename} must have one consistent localized set of Open Graph tags.`,
    );
    assert.deepEqual(
      actualTwitter,
      expectedTwitter.sort(([leftName], [rightName]) => leftName.localeCompare(rightName)),
      `${filename} must have one consistent Twitter card set for configured origins only.`,
    );
    personJsonLd(html, filename, locale, siteOrigin);
    if (siteOrigin) {
      assert.equal(canonicalTags.length, 1, `${filename} must have exactly one canonical link.`);
      assert.equal(
        tagAttribute(canonicalTags[0], 'href'),
        `${siteOrigin}/${locale}/`,
        `${filename} must self-canonicalize to its absolute HTTPS locale URL.`,
      );
      const expectedAlternates = [
        ['en', `${siteOrigin}/en/`],
        ['pl', `${siteOrigin}/pl/`],
        ['x-default', `${siteOrigin}/en/`],
      ].sort(([leftLanguage], [rightLanguage]) => leftLanguage.localeCompare(rightLanguage));
      const actualAlternates = alternateTags
        .map((tag) => [tagAttribute(tag, 'hreflang'), tagAttribute(tag, 'href')])
        .sort(([leftLanguage], [rightLanguage]) => leftLanguage.localeCompare(rightLanguage));
      assert.deepEqual(
        actualAlternates,
        expectedAlternates,
        `${filename} must have the reciprocal en/pl/x-default hreflang set.`,
      );
      assert.equal(
        robotsTags.length,
        0,
        `${filename} must not include a robots override when SITE_URL is configured.`,
      );
    } else {
      assert.equal(
        canonicalTags.length,
        0,
        `${filename} must omit canonical links without SITE_URL.`,
      );
      assert.equal(
        alternateTags.length,
        0,
        `${filename} must omit hreflang links without SITE_URL.`,
      );
      assert.equal(
        robotsTags.length,
        1,
        `${filename} must have one robots meta tag without SITE_URL.`,
      );
      assert.equal(
        tagAttribute(robotsTags[0], 'content')?.toLowerCase(),
        'noindex, nofollow',
        `${filename} must be noindexed without SITE_URL.`,
      );
    }
  }

  assert.notEqual(
    htmlText(htmlPages.en),
    htmlText(htmlPages.pl),
    'English and Polish output must contain distinct content.',
  );
  const notFound = await readFile(join(resolvedDist, '404.html'), 'utf8');
  const notFoundDocument = htmlDocument(notFound);
  verifyFaviconLinks(notFound, '404.html', filePaths);
  assert.equal(
    themeColor(notFound, '404.html'),
    expectedThemeColor,
    '404.html theme-color must match index.html.',
  );
  assert.match(notFound, /<h1\b[^>]*>[^<]+<\/h1>/i, '404.html must contain a useful heading.');
  assert.match(notFound, /href=["']\/en\/["']/i, '404.html must link to English.');
  assert.match(notFound, /href=["']\/pl\/["']/i, '404.html must link to Polish.');
  const notFoundStylesheets = [
    ...notFoundDocument.querySelectorAll('link[rel~="stylesheet"][href]'),
  ].map((link) => link.getAttribute('href'));
  assert.ok(notFoundStylesheets.length > 0, '404.html must link to a stylesheet.');
  for (const href of notFoundStylesheets) {
    assert.ok(href.startsWith('/assets/'), '404.html must use a local shared stylesheet.');
    assert.ok(filePaths.has(href.slice(1)), `404.html references missing stylesheet ${href}.`);
  }
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
  return {
    files: filePaths.size,
    bytes: bytes.reduce((total, size) => total + size, 0),
    siteOrigin,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const result = await verifyOutput();
    console.log(`Output verified: ${result.files} files, ${result.bytes} bytes.`);
    if (!result.siteOrigin) {
      console.log('SITE_URL is unset; pages remain noindex without canonical or hreflang tags.');
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
