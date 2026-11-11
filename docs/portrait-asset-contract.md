# Hero portrait asset contract

**Status: ASSET-BLOCKED.** The repository does not contain an owner-approved, clean portrait source. The current hero remains usable with the decorative scene alone; it does not fabricate or imply a person image.

## Required source and approval

- The owner supplies or explicitly approves the dedicated portrait and confirms the right to publish it.
- The person wears a white or light shirt, with natural brown hair and neutral natural face lighting.
- The source has no pink or magenta rim light, hair halo, skin tint, edge glow, or filter. Do not derive the portrait by cropping a full-page mockup.
- Prefer a transparent-background cutout with clean hair edges. A plain background is acceptable if transparency would damage the source.

## Suggested files and crop

- Source: `public/assets/portraits/hero-source.png` (keep the approved original local).
- Web exports: `public/assets/portraits/hero-480.webp` and `public/assets/portraits/hero-960.webp`; add an AVIF variant only when it improves the measured result. Keep a PNG fallback only if transparency or browser support requires it.
- Preserve intrinsic dimensions and use `srcset`/`sizes`; reserve the final aspect ratio in layout before loading. The portrait is the hero visual, so do not lazy-load it when it becomes the LCP image.
- Compose from chest/shoulders upward with headroom and side margin. Keep the face and hair within a centered mobile-safe crop at 320–430 px and avoid placing title, decoration, or controls over the face.
- Before publication, review the actual source and desktop/mobile crops at 1440×960 and 390×844.

## `NO-PINK-HAIR` visual QA

**Not run:** there is no portrait to inspect. Passing the page's palette or accessibility tests does not verify hair color or edge lighting. When an approved asset is added, capture desktop and phone screenshots and check natural brown hair, neutral skin, no pink/magenta edge tint, no masking seam, and no nearby glow/filter artifact. Keep this check blocked until that review is complete.
