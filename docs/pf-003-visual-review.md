# PF-003 visual review

**Result:** local visual QA completed; no material layout issue found at the reviewed sizes. **Owner status: `OWNER VISUAL APPROVAL PENDING`.** The owner still needs to review the actual renders before the visual gate can be closed.

## Capture details

- Command: `npm run qa:visual` (builds the production output and captures the production preview).
- Browser: Playwright Chromium; capture settings are recorded in `test-results/visual-review/manifest.json`.
- Viewports: `390×844` and `1440×900` in English and Polish.
- Local review images: `en-390x844.png`, `en-1440x900.png`, `pl-390x844.png`, and `pl-1440x900.png` in the ignored `test-results/visual-review/` directory. These are generated review artifacts and must not be committed.

## Observations

- The hero and portrait are visible in both languages. The portrait shows the light shirt and natural hair color; no pink halo or colored hair edge is visible.
- The page retains the dark blue/violet palette. Pink stays a small accent in the project art and brand mark.
- The three project cards render in the expected order. Their descriptions and technology chips wrap within the cards; desktop card actions stay aligned and all three repository links remain visible.
- About, Technologies, After hours, profile links, and footer follow the project section with consistent spacing. Polish text fits without collisions.
- Mobile content is a single column. Social links stack, portrait and CTA do not overlap, and no horizontal scrolling was observed.
- Automated responsive checks cover both locales from `320` through `1920` pixels, including `320` and `820` pixels. They verify no horizontal overflow, visible CTA bounds, loaded card artwork, card content width, and repository-link bounds.
- Keyboard focus and hover styles are also covered by E2E checks: the skip link has a visible blue focus outline, the primary CTA brightens on hover, and the profile link border changes on hover.

No CSS or component adjustment was needed after reviewing these renders. The screenshot evidence is local only; it is not a Playwright snapshot baseline and is not part of Git history.

## Owner review

Please review all four images above, especially the portrait framing, project-card readability, and the longer Polish copy. Until then, the status remains **`OWNER VISUAL APPROVAL PENDING`**.
