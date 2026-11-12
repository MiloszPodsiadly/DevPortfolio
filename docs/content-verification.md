# Content verification and maintenance

The [content evidence ledger](content-evidence-ledger.md) records the public repositories, source revisions, and claims checked for PF-003. It distinguishes source-backed project facts from owner approval of the exact copy. The [owner review card](pf-003-owner-content-approval.md) is the current PL/EN copy awaiting final review; this checklist is a maintenance process, not evidence that every publication gate has passed.

## Current PF-003 record

- The three project cards and their project technologies are source-checked in the ledger. StockRescue AI is explicitly described as **in development**.
- Exact About and After Hours wording remains `OWNER-APPROVAL-PENDING` in both languages.
- GitHub and LinkedIn URLs were supplied by the owner and are recorded as `OWNER-APPROVED` for the URLs only. This does not approve profile biography or employment claims.
- No demo, email, Instagram, Discord, employer detail, private-system detail, or unverified metric is published.
- Final visual approval is tracked separately in [the PF-003 visual review](pf-003-visual-review.md).

## When adding or changing public content

- [ ] Record the exact public statement and locale.
- [ ] Record the public source URL, source commit SHA, and date checked; compare the claim with the README, source code, or build manifest as appropriate.
- [ ] State whether the feature is released, in development, or only planned. Do not describe planned work as implemented.
- [ ] Separate verified facts from the owner's approval of wording and publication.
- [ ] Check that the text contains no private client, employer, workplace-system, or personal information and no unsupported metrics, credentials, or experience claims.
- [ ] Confirm every repository and profile URL. Publish a demo link only after verifying that it works and belongs to the project.
- [ ] Keep the approved project set to Fraud Detection Platform, StockRescue AI, and Chess Project; do not add HopOn Netherlands.
- [ ] Check image/font rights and licenses, and keep private originals out of `public/`.
- [ ] Build both locales and inspect their generated HTML with JavaScript disabled.

## Owner approval record

Record approval only after the owner reviews the exact PL and EN copy and the precise URLs intended for publication. An approval of a source fact, an image, or a prior wording does not automatically approve a changed version.
