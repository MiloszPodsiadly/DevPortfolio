import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { verifyOutput } from './verify-output.mjs';

let fixtureDirectory;

async function writeValidFixture(directory, siteOrigin) {
  await mkdir(join(directory, 'en'), { recursive: true });
  await mkdir(join(directory, 'pl'), { recursive: true });
  await mkdir(join(directory, 'assets'), { recursive: true });
  await writeFile(join(directory, 'assets', 'client-abcdef12.js'), '');
  await writeFile(join(directory, 'assets', 'site-abcdef12.css'), '');
  await writeFile(join(directory, '_redirects'), '/ /en/ 302\n');
  await writeFile(
    join(directory, '404.html'),
    '<html lang="en"><body><main><h1>Page not found</h1><a href="/en/">English</a><a href="/pl/">Polski</a></main></body></html>',
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
    const html = `<html lang="${locale}"><head><title>Junior Software Developer</title><meta name="description" content="Portfolio introduction"><link rel="stylesheet" href="/assets/site-abcdef12.css">${seo}<script type="module" src="/assets/client-abcdef12.js"></script></head><body><a href="#main-content">Skip</a><nav><a href="/en/">English</a><a href="/pl/">Polski</a></nav><main id="main-content"><h1>Junior Software Developer</h1><p>${introduction}</p></main></body></html>`;
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
      '<html lang="en"><head><title>Sample</title><meta name="description" content="Sample page"></head><body><h1>Junior Software Developer</h1><h1>Duplicate</h1></body></html>',
    );
    await writeFile(
      join(fixtureDirectory, 'pl', 'index.html'),
      '<html lang="pl"><body><h1>Empty</h1></body></html>',
    );
    await writeFile(
      join(fixtureDirectory, '404.html'),
      '<h1>Not found</h1><a href="/en/">EN</a><a href="/pl/">PL</a>',
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
    ).resolves.toMatchObject({ files: 6 });
  });
});
