# Personal Portfolio

A small, static-first portfolio for **Junior Software Developer**. It prerenders English and Polish HTML at build time, then hydrates the same React tree in the browser. PF-002 provides the blue/violet visual identity, responsive hero and navigation. PF-003 adds three evidence-backed project cards (Fraud Detection Platform, StockRescue AI, and Chess Project), About, Technologies, After Hours, and GitHub/LinkedIn sections in both locales. StockRescue AI is identified as in development. Final SEO remains PF-004 work.

Project facts and source revisions are recorded in the [content evidence ledger](docs/content-evidence-ledger.md). The [PF-003 owner review card](docs/pf-003-owner-content-approval.md) contains the exact public copy in both languages. Source verification does not mean the owner has approved the final autobiographical wording or visual presentation; those approvals remain separate release gates.

The hero uses an owner-supplied portrait when the optimized WebP exports are present and falls back to the decorative SVG scene when they are absent. The original stays in the ignored `assets-source/portraits/` directory; only the 480 px and 960 px WebP exports are included in the public build. See the [portrait asset contract](docs/portrait-asset-contract.md) for the local export and visual review steps.

## Requirements

- Node.js `26.13.0` (`.node-version`)
- npm `11.20.0` (bundled with the pinned Node release)

On Windows, open PowerShell in the repository after installing the pinned Node release:

```powershell
node --version
npm ci
npm run dev
```

The local development shell is available at the Vite URL printed in the terminal. The production build emits static files to `dist/`.

## Scripts

| Command                        | Purpose                                                                                    |
| ------------------------------ | ------------------------------------------------------------------------------------------ |
| `npm run dev`                  | Start the local Vite development server.                                                   |
| `npm run build`                | Build hashed client assets and prerender `/en/`, `/pl/`, and `404.html`.                   |
| `npm run preview`              | Serve the built files locally.                                                             |
| `npm run lint`                 | Run ESLint.                                                                                |
| `npm run format:check`         | Check formatting with Prettier.                                                            |
| `npm run typecheck`            | Run strict TypeScript checks.                                                              |
| `npm run test`                 | Run unit and component tests with Vitest.                                                  |
| `npm run verify:output`        | Fail if the built static output breaks its contracts.                                      |
| `npm run test:e2e`             | Run Playwright browser and accessibility checks against the built preview.                 |
| `npm run test:portrait-parity` | Check portrait loading in Vite dev and production preview, plus the no-image dev fallback. |
| `npm run qa:visual`            | Build and capture four owner-review screenshots in the ignored QA directory.               |

Typical local verification:

```powershell
npm ci
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run build
npm run verify:output
npx playwright install chromium
npm run test:portrait-parity
npm run test:e2e
npm run qa:visual
```

`qa:visual` writes `en-390x844.png`, `en-1440x900.png`, `pl-390x844.png`, and `pl-1440x900.png` under the ignored `test-results/visual-review/` directory. It records the Chromium build and capture settings in `manifest.json`; the images are local review artifacts and are not committed.

The initial HTML contains its content and links before JavaScript runs. React hydration adds progressive enhancement; JavaScript is not required to read either locale. The production build has no server, API, database, analytics, contact form, or external runtime fonts.

## Build and SEO inputs

`npm run build` creates `dist/en/index.html`, `dist/pl/index.html`, `dist/404.html`, the hashed client assets, and Cloudflare Pages `_redirects`. It does not create a root SPA fallback. `public/_redirects` asks Cloudflare Pages to send `/` to `/en/` with HTTP 302; local Vite preview does not prove that hosted redirect or the hosted HTTP 404 behavior.

No canonical domain has been confirmed. Builds omit canonical and hreflang tags until `SITE_URL` is supplied as an absolute HTTPS origin:

```powershell
$env:SITE_URL = "https://your-confirmed-domain.example"
npm run build
```

The sample above is explanatory only; replace it with an owner-confirmed origin before use. Do not publish a placeholder domain. Canonical, hreflang, sitemap, and full SEO metadata remain PF-004 release work.

## Repository and deployment state

The planning files stay in the ignored `prompts/` directory and are not duplicated into tracked documentation. The masterplan source is `prompts/plan/Personal_Portfolio_Masterplan_v2.1_Blue_Violet.md` in the owner's workspace.

The GitHub Actions workflow is defined in `.github/workflows/ci.yml`. It runs separate `quality` and `e2e` jobs for pushes to `main` and pull requests targeting `main`; the E2E job uses the Playwright image version matched to the lockfile. A workflow definition is not proof that checks passed: inspect the checks for the exact PR head before merging.

Branch protection, required-check settings, Cloudflare Pages configuration, preview deployment, custom domain, and production deployment are owner-managed and are not asserted by this repository. See [Cloudflare setup](docs/cloudflare-setup.md) and [GitHub settings](docs/github-settings.md) for setup and release checks. For changes to public content, follow the [content verification checklist](docs/content-verification.md) and retain evidence in the ledger.
