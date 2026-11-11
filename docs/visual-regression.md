# Repeatable visual QA

The main CI has no screenshot baselines and does not compare rendered images. Playwright functional, accessibility, responsive, and portrait-parity checks remain CI gates. `npm run qa:visual` creates a separate set of local screenshots for human review; it fails if either public WebP export or the loaded portrait is missing.

## Capture

Install the project dependencies and matching Chromium browser once, then run:

```powershell
npm ci
npx playwright install chromium
npm run qa:visual
```

The command builds the static site, serves the production preview, and captures:

- `test-results/visual-review/en-390x844.png`
- `test-results/visual-review/en-1440x900.png`
- `test-results/visual-review/pl-390x844.png`
- `test-results/visual-review/pl-1440x900.png`

Each page waits for `document.fonts.ready` and for the real portrait to decode before capture. The script checks the localized `alt`, loaded image dimensions, layout overlap, and browser errors. `manifest.json` records Chromium's version, operating system, architecture, viewport, DPR, color scheme, and reduced-motion setting. The entire `test-results/` directory is ignored by Git; do not commit these images.

## Consistent captures

For comparisons across runs, use the same operating system, Chromium build, and installed fonts. Windows and Linux may render fonts and antialiasing differently. The browser package is locked by `@playwright/test` `1.65.0`; CI uses `mcr.microsoft.com/playwright:v1.65.0-noble`.

To create the canonical Linux render from the repository root where Docker is available:

```sh
docker run --rm -v "$PWD:/work" -w /work mcr.microsoft.com/playwright:v1.65.0-noble \
  bash -lc 'npm ci && npm run qa:visual'
```

This is a manual artifact-generation command. The CI workflow does not upload, compare, or regenerate visual screenshots, and there are no checked-in image baselines to update.

## Owner review checklist

The script can verify that an image loaded and that the copy/CTA do not overlap the visual area. It cannot approve the person's identity, the publication decision, or whether the crop looks right. Owner approval remains pending until the four images are reviewed for:

- light shirt, full face and hair, natural skin and hair color, and no pink/magenta halo;
- crop and headroom at phone and desktop sizes;
- legible contrast, visible CTA, and scene decorations kept behind the portrait;
- correct Polish and English labels and layout;
- no horizontal scroll, clipping, or text overlap.

Record `CODE VERIFIED` separately from `OWNER APPROVED`. A successful capture is not visual approval.
