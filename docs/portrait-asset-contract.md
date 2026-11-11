# Hero portrait asset contract

**Status: integrated locally; final visual acceptance is pending.** The owner supplied a real portrait, and the Hero now uses optimized WebP exports when both variants are available. The decorative SVG remains the fallback when the exports are absent or the image fails to load.

## Required source and approval

- The source supplied for this package is `assets-source/portraits/hero-source.png`; the original is ignored by Git and stays outside the published tree.
- The person wears a white or light shirt, with natural brown hair and neutral natural face lighting.
- The source has no pink or magenta rim light, hair halo, skin tint, edge glow, or filter. Do not derive the portrait by cropping a full-page mockup.
- Prefer a transparent-background cutout with clean hair edges. A plain background is acceptable if transparency would damage the source.

The current owner-supplied source is a clean, photorealistic head-and-shoulders portrait with a light shirt, natural brown hair and a neutral gray background. It has no visible pink halo and meets the masterplan's no-jacket direction. The background is intentionally preserved; no face, hair or clothing edits are applied.

## Local source and public exports

- Keep the original outside the published tree at `assets-source/portraits/hero-source.png`. Both `assets-source/` and `prompts/` are ignored by Git; never stage either original.
- The supplied PNG is 1122×1402 and contains no EXIF or text metadata chunks. `npm run export:portrait` uses the installed Playwright Chromium canvas to resize and encode metadata-free WebP variants while preserving the source aspect ratio.
- Exports are `public/assets/portraits/hero-480.webp` (480×600) and `public/assets/portraits/hero-960.webp` (960×1200). The client uses `srcset`/`sizes`, intrinsic dimensions, eager loading and high fetch priority because the portrait is in the Hero.
- The build includes the portrait only when both exports exist. If both are absent, the prerendered page omits the image and retains the decorative fallback, including with JavaScript disabled. A partial pair fails the build.
- Compose from chest/shoulders upward with headroom and side margin. Keep the face and hair within a centered mobile-safe crop at 320–430 px and avoid placing title, decoration, or controls over the face.
- Before publication, review the actual source and desktop/mobile crops at 1440×900 and 390×844.

## `NO-PINK-HAIR` visual QA

The source photo was inspected and shows natural brown hair without a visible pink/magenta halo. The owner should review the desktop and phone presentation for crop, neutral skin, edge quality, overlap and scene glow on the hair. CI does not capture or compare screenshots.
