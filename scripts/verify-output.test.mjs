import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { verifyOutput } from './verify-output.mjs';

let fixtureDirectory;

async function writeValidFixture(directory, siteOrigin, portraitAvailable = false) {
  await mkdir(join(directory, 'en'), { recursive: true });
  await mkdir(join(directory, 'pl'), { recursive: true });
  await mkdir(join(directory, 'assets'), { recursive: true });
  await mkdir(join(directory, 'assets', 'projects'), { recursive: true });
  await writeFile(join(directory, 'assets', 'client-abcdef12.js'), '');
  await writeFile(join(directory, 'assets', 'site-abcdef12.css'), '');
  for (const artwork of ['fraud-signals.svg', 'stock-rescue.svg', 'chess-piece.svg']) {
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
    '<html lang="en"><head><meta name="theme-color" content="#070D20"></head><body><main><h1>Page not found</h1><a href="/en/">English</a><a href="/pl/">Polski</a></main></body></html>',
  );

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
      : '';
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
    const html = `<html lang="${locale}"><head><title>Junior Software Developer</title><meta name="theme-color" content="#070D20"><meta name="description" content="Portfolio introduction"><link rel="stylesheet" href="/assets/site-abcdef12.css">${seo}<script type="module" src="/assets/client-abcdef12.js"></script></head><body><div id="root" data-portrait-available="${portraitAvailable}">${portrait}<a href="#main-content">Skip</a><nav><a href="/en/">English</a><a href="/pl/">Polski</a></nav><main id="main-content"><h1>Junior Software Developer</h1><p>${introduction}</p><section id="projects">${projectCards}</section><section id="about"><h2>About</h2><p>${about}</p></section><section id="technologies"><h2>Technologies</h2><p>Java</p></section><section id="after-hours"><h2>${afterHours}</h2></section><section id="social"><h2>Profiles</h2>${socialLinks}</section></main></div></body></html>`;
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

  it('fails when localized pages contain a broken HTML contract', async () => {
    fixtureDirectory = await mkdtemp(join(tmpdir(), 'portfolio-output-fixture-'));
    await mkdir(join(fixtureDirectory, 'en'), { recursive: true });
    await mkdir(join(fixtureDirectory, 'pl'), { recursive: true });
    await writeFile(
      join(fixtureDirectory, 'en', 'index.html'),
      '<html lang="en"><head><title>Sample</title><meta name="theme-color" content="#070D20"><meta name="description" content="Sample page"></head><body><h1>Junior Software Developer</h1><h1>Duplicate</h1></body></html>',
    );
    await writeFile(
      join(fixtureDirectory, 'pl', 'index.html'),
      '<html lang="pl"><head><meta name="theme-color" content="#070D20"></head><body><h1>Empty</h1></body></html>',
    );
    await writeFile(
      join(fixtureDirectory, '404.html'),
      '<meta name="theme-color" content="#070D20"><h1>Not found</h1><a href="/en/">EN</a><a href="/pl/">PL</a>',
    );
    await writeFile(join(fixtureDirectory, '_redirects'), '/ /en/ 302\n');
    await expect(verifyOutput({ distDirectory: fixtureDirectory })).rejects.toThrow(
      'must have one h1',
    );
  });

  it('accepts conditional canonical and hreflang tags only for a confirmed origin', async () => {
    fixtureDirectory = await mkdtemp(join(tmpdir(), 'portfolio-output-fixture-'));
    await writeValidFixture(fixtureDirectory, 'https://portfolio.dev');
    await expect(
      verifyOutput({ distDirectory: fixtureDirectory, siteUrl: 'https://portfolio.dev' }),
    ).resolves.toMatchObject({ files: 9 });
  });

  it('accepts both optimized portrait exports when the prerendered page enables the portrait', async () => {
    fixtureDirectory = await mkdtemp(join(tmpdir(), 'portfolio-output-fixture-'));
    await writeValidFixture(fixtureDirectory, undefined, true);

    await expect(verifyOutput({ distDirectory: fixtureDirectory })).resolves.toMatchObject({
      files: 11,
    });
  });

  it('fails when a production page theme-color differs from the development template', async () => {
    fixtureDirectory = await mkdtemp(join(tmpdir(), 'portfolio-output-fixture-'));
    await writeValidFixture(fixtureDirectory, undefined, true);
    const polishPath = join(fixtureDirectory, 'pl', 'index.html');
    const polishHtml = await readFile(polishPath, 'utf8');
    await writeFile(polishPath, polishHtml.replace('#070D20', '#FF5BA7'));

    await expect(verifyOutput({ distDirectory: fixtureDirectory })).rejects.toThrow(
      'pl/index.html theme-color must match index.html.',
    );
  });
});
