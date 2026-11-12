# PF-003 — Verified Projects, About Me, Skills & Social Profiles

## Scope delivered

- Three localized project cards: Fraud Detection Platform, StockRescue AI (**in development**), and Chess Project.
- About, Technologies, After Hours, GitHub, and LinkedIn sections in the prerendered English and Polish pages.
- Project illustrations are original SVG assets. No demo links or fourth project are shown.
- Content governance documentation distinguishes source-backed facts from the owner's approval of exact personal copy.

## Evidence

- [Content evidence ledger](content-evidence-ledger.md) records the source repositories and checked revisions: Fraud Detection Platform `88805a845b18c3544c868597e1406ae6bf2592f3`, StockRescue `c75770d60453d07734116eb540e432840238d0ab`, and Chess Project `db8e4d4d92797e1b0ff4fc2e12025bcc91af6d9c`.
- [Owner content review](pf-003-owner-content-approval.md) contains the exact PL/EN copy. Source verification does not imply approval of autobiographical wording.
- No unsupported metrics, production-readiness claims, private workplace details, or HopOn Netherlands content are included.

## Test evidence

Local checks on the current working tree:

- `npm ci` — completed; it reported that the available Node/npm versions (`25.8.2` / `11.11.1`) do not match the repository pins (`26.13.0` / `11.20.0`).
- `npm run format:check`, `npm run lint`, `npm run typecheck` — passed.
- `npm run test` — 39/39 passed.
- `npm run build`, `npm run verify:output` — passed; 11 output files verified. Canonical/hreflang remain PF-004 work because `SITE_URL` is unset.
- `npm run test:portrait-parity` — passed in dev and preview, including the no-image fallback.
- `npm run test:e2e` — 16/16 passed, including both locales, no-JavaScript content, axe checks, responsive widths, card asset/link geometry at 320/820 px, and keyboard/hover states.
- `npm run qa:visual` — passed and captured four local review images; see [visual review](pf-003-visual-review.md). PNGs and manifest remain in the ignored QA directory and are not committed.

The existing green GitHub Actions run [43210582051](https://github.com/MiloszPodsiadly/DevPortfolio/actions/runs/43210582051) verifies the earlier PR head `af6782b9967527405cb528c25567e9c016c636bd`; it does **not** verify this fix-pack working tree. Confirm `quality` and `e2e` on the new pushed PR head before merge.

## Owner gates

- Exact About and After Hours copy remains `OWNER-APPROVAL-PENDING` in both languages. Project facts and technologies are source-verified; the exact displayed wording still needs the owner's review.
- GitHub and LinkedIn URLs were supplied by the owner and are approved for the URLs only; no biography or employment claims are copied.
- The owner supplied the portrait for website use. The original is not in `public/`; the rendered portrait and framing still need visual approval. See [visual review](pf-003-visual-review.md).

## Out of scope

PF-004 SEO/OG/sitemap, PF-005 release hardening, PF-006 Cloudflare/domain launch, Supabase, any backend or database, and HopOn Netherlands.

## Risks and rollback

Review the preview after the fix-pack commits are pushed, especially the portrait framing and longer Polish copy. If a content or layout issue appears, correct the source copy/styles on this branch, rerun the checks above, and keep the PR unmerged until owner approvals and CI on the exact head are complete. This draft does not change the GitHub PR body or merge the PR.
