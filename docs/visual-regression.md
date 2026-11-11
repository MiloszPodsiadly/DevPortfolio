# Visual regression and acceptance

`e2e/portfolio.spec.ts` compares Polish and English full-page renders at 390×844 and 1440×900 against Playwright snapshots in `e2e/portfolio.spec.ts-snapshots/`. Responsive assertions cover 320, 375, 390, 430, 768, 820, 821, 1024, 1280, 1440, and 1920 CSS-pixel widths. CI uses the exact Playwright image tag matched to `@playwright/test` and disables motion only for screenshot capture.

Run the normal `npm run test:e2e` command to compare against the checked-in baseline. Update snapshots only for an intentional visual change, inspect the resulting images and diffs, then review the snapshot files before accepting them:

```powershell
npm run build
npm run test:e2e -- --update-snapshots
```

## Acceptance checklist

- Navy, blue and violet remain dominant; pink is limited to small decorative accents.
- The moon and scene remain cool blue/lavender and do not reduce text contrast.
- At 390×844, copy and CTA precede the decorative scene without overlap or horizontal scrolling.
- At 1440×900, the hero and project heading fit the viewport; lower sections remain present in the full-page render.
- Navigation labels and page content render correctly in both locales.
- The current snapshots represent the decorative SVG fallback only. They do not verify portrait identity, wardrobe, hair color or halo. Owner visual approval is still pending, and `NO-PINK-HAIR` remains blocked until a separately approved portrait is inspected.
