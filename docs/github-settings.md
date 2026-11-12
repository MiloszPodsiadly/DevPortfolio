# GitHub repository settings checklist

## Controls defined in the repository

`.github/workflows/ci.yml` runs on pushes to `main` and pull requests targeting `main`. It defines two independent required-quality outcomes:

- `quality` — formatting, lint, TypeScript, unit/component tests, static build, and output verification.
- `e2e` — locked dependency install, Playwright version report, build/output verification, Chromium browser/accessibility tests, and Vite dev/preview portrait parity in the Playwright container pinned to the version in `package-lock.json`.

The workflow uses a least-privilege `contents: read` token and cancels obsolete runs for the same branch or PR. A workflow file or a mergeable PR does not prove that a check passed. Review the latest run attached to the exact PR head SHA; distinguish a failed job from a skipped job.

## Owner-run GitHub settings

These settings live in GitHub's repository UI and have not been verified from this checkout:

1. Protect `main` and require updates through pull requests.
2. After both jobs have completed successfully at least once, require the `quality` and `e2e` status checks by their displayed names.
3. Block force pushes and branch deletion.
4. Require review where available, dismiss stale approvals after new commits, and avoid routine administrator bypass where the account permits it.
5. Confirm whether Cloudflare Pages deploys from `main`; do not infer this from the workflow file.

The repository is private. GitHub documents protected branches for private repositories on Pro, Team, Enterprise Cloud, and Enterprise Server; a workflow file does not enable protection. The owner's current plan and repository settings have not been verified, so do not assume `main` requires either status check. See [GitHub's protected branch plan availability](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches).

## CI troubleshooting

The E2E job uses the official `mcr.microsoft.com/playwright:v1.65.0-noble` image, which supplies the browser and system dependencies. Its version must stay aligned with `@playwright/test` in `package-lock.json`. `npm ci` runs before `npx playwright --version`, so the reported executable comes from the locked project dependency. The workflow does not run APT to install Playwright dependencies. A missing browser executable points to an image/package version mismatch; a test assertion failure is a browser-test failure and should not be retried as a network problem.

## PF-006 hosted HTTP smoke test

Local `verify:output` checks generated files; it does not prove Cloudflare's HTTP status codes or redirects. No real Pages preview URL was provided for PF-004, so hosted behavior is **NOT VERIFIED**. Once Cloudflare supplies an actual preview URL, set it and run these exact HEAD requests:

```powershell
if ([string]::IsNullOrWhiteSpace($env:PAGES_PREVIEW_URL)) { throw 'Set PAGES_PREVIEW_URL to the actual Cloudflare Pages preview origin first.' }
$preview = $env:PAGES_PREVIEW_URL.TrimEnd('/')

curl.exe -I "$preview/"
curl.exe -I "$preview/en/"
curl.exe -I "$preview/pl/"
curl.exe -I "$preview/robots.txt"
curl.exe -I "$preview/sitemap.xml"
curl.exe -I "$preview/random-missing-route"
```

Expected: `/` returns `302` with `Location: /en/`; `/en/`, `/pl/`, and `/robots.txt` return `200`; an unknown route returns `404`, never a `200` SPA fallback. `/sitemap.xml` returns `200` only when that preview build used its actual origin as `SITE_URL`; otherwise it should be absent and `robots.txt` should not contain a `Sitemap:` directive. These hosted checks remain deferred until a real preview exists and were not verified by local output checks.
