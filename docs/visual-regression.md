# Visual acceptance

CI does not create, upload, or compare Playwright screenshots. Screenshot baselines were removed because they made CI depend on image snapshots. Playwright still checks responsive layout and behavior at 320, 375, 390, 430, 768, 820, 821, 1024, 1280, 1440, and 1920 CSS-pixel widths in both locales.

Review visual changes manually in the browser at 390×844 and 1440×900. The ignored `test-results/` directory is reserved for temporary Playwright failure artifacts and must not be committed.

## Acceptance checklist

- Navy, blue and violet remain dominant; pink is limited to small decorative accents.
- The moon and scene remain cool blue/lavender and do not reduce text contrast.
- At 390×844, copy and CTA precede the decorative scene without overlap or horizontal scrolling.
- At 1440×900, the hero and project heading fit the viewport.
- Navigation labels and page content render correctly in both locales.
- Manual review does not replace owner approval of identity, publication, crop or wardrobe. The supplied source shows a light shirt without a jacket; final visual approval remains with the owner.
