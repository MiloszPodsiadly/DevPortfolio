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

Local `verify:output` checks generated files; it does not prove Cloudflare's HTTP status codes or redirects. After a real deployment and after setting `SITE_URL` to the owner-confirmed origin, run these commands and inspect the status and `Location` header:

```powershell
if (-not $env:SITE_URL) { throw 'Set SITE_URL to the confirmed HTTPS origin first.' }

curl.exe --silent --show-error --dump-header - --output NUL "$env:SITE_URL/"
curl.exe --silent --show-error --dump-header - --output NUL "$env:SITE_URL/en/"
curl.exe --silent --show-error --dump-header - --output NUL "$env:SITE_URL/pl/"
curl.exe --silent --show-error --dump-header - --output NUL "$env:SITE_URL/random-missing-route"
```

Expected: `/` returns `302` with `Location: /en/`; `/en/` and `/pl/` return `200`; an unknown route returns `404`, never a `200` SPA fallback. These hosted checks remain deferred until PF-006 and were not verified by local preview.
