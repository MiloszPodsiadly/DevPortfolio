# Maintenance

## Development and checks

Use the Node version in `.node-version` and the npm version in `package.json`.

```sh
npm ci
npm run dev
```

Before releasing a change, run the same checks as CI:

```sh
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
npm run verify:output
npm run test:portrait-parity
npm run test:e2e
```

Playwright checks require Chromium (`npx playwright install chromium`). `npm run preview` serves the production build; `npm run qa:visual` creates local review screenshots under ignored `test-results/`.

## Content and assets

- Edit bilingual page copy in `src/locales/index.ts`, project cards in `src/content/projects.ts`, the technology overview in `src/content/skills.ts` and profile URLs in `src/content/socials.ts`.
- The scene scales as one composition. Its dimensions and layout are in `src/styles/portfolio-canvas.css`; shared theme and interaction styles are in `src/styles/globals.css`.
- Everything under `public/` is published. Keep only runtime assets and their license notices there. Technology SVG attribution is in `public/assets/technologies/LICENSE*.txt`.
- Originals and generation prompts stay in ignored `assets-source/` and `prompts/`. Do not commit these directories or Playwright screenshots/reports.
- `npm run export:portrait` regenerates both WebP sizes from the local portrait source. Both exports must be present, or both absent; without them, the page uses its decorative fallback.
- `public/assets/og/portfolio-cover.png` is the social preview; retain its 1200 × 630 dimensions. `npm run export:favicon` regenerates the PNG favicon from its SVG.

## Static hosting

Cloudflare Pages uses `npm run build`, output directory `dist` and production branch `main`. Set `SITE_URL` to the confirmed HTTPS site origin for production. The build then emits canonical URLs, language alternates, a sitemap and absolute social-preview URLs. Without it, pages use `noindex, nofollow` and omit the sitemap and canonical URLs.

The output contains `/en/`, `/pl/`, `404.html` and `_redirects` for `/` → `/en/` (302). After deployment, check direct route loads, the root redirect, HTTP 404 behavior and social-preview metadata on the actual host.
