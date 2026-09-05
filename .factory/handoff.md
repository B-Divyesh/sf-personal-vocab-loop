# Personal Vocab Loop — review 4 handoff

## Status

**FAIL.** Independent review 4 found one major plain-words defect and zero
untested claims. No product code was changed.

## What was done

- Reviewed the live site cold at 390×844 and 1440×900 before scrolling.
- Exercised the one-click populated demo, voice playback, mutation, Reset,
  persistent demo banner, Start for real, real-data isolation, keyboard use,
  invalid and boundary inputs, import recovery, and live offline recall.
- Checked all routes, route titles, metadata, links, legal pages, designed 404,
  focus, reduced motion, accessibility, privacy requests, response policy,
  rate limiting, performance, and deployment identity.
- Read and rechecked every earlier verification/review finding, including the
  minor findings.
- Wrote `.factory/review-4.md` and copied the QA result to `/work/.evidence/`.

## Finding

F-4-1: visible metaphor/mood copy remains. The root says “Your private
language lab”; Capture says “New signal”; empty Recall says “Recall clear”; and
Settings says “signal treatment.” This violates the explicit plain-words rule
even though the job h1, audience, and first action are clear.

## Verification

- Clean checkout: `/tmp/pvl-review4-clean.0WUrGL/repo`.
- Implementation candidate: `0d3256f12cee8fbafdc856eaf8575935b7cc010b`.
- Documentation baseline: `5fb7d97052cea8dec07c4fcd2660a9078ea9ec8f`.
- `npm ci`: pass, zero reported vulnerabilities.
- Every one of 16 exact `.factory/claims.json` commands: pass independently.
- `npm test`: pass, Vitest 4/4 and Playwright 35/35.
- `npm run typecheck`, `npm run lint`, `npm run build`: pass.
- Live URL verifier and Axe route matrix: pass; zero Axe violations.
- Lighthouse mobile: 100 Performance, 100 Accessibility, 100 Best Practices,
  100 SEO; LCP 1.2 s, CLS 0, TBT 0 ms.
- Live built assets match the clean candidate build byte-for-byte.

## Next step

Replace or remove the four metaphor/mood labels listed in F-4-1, update the
copy audit, deploy, and repeat the cold live first-read check. No other product
gap was found.
