# Personal Vocab Loop — polish round 2 handoff

## Status

Release candidate repaired, pushed, deployed, and accepted in a cold production
verification. Every cumulative finding is resolved.

## What changed

- Replaced the demo’s two-note sound with documented spoken Spanish synthetic
  speech, stored in the isolated demo database and offline shell.
- Stabilized backup import with a visible busy state, blocked navigation, and a
  completion message; strengthened the voice claim with hash and duration proof.
- Standardized the product language to “phrase” and the retrieval action to
  “Recall.” Rewrote all review-2 copy findings and added a real free-core claim.
- Preserved the pixel/demoscene private-memory-terminal identity while fixing
  390 px and 200% text-size layout behavior.
- Updated version 1.0.2, catalog copy, claims, demo notes, provenance, copy audit,
  README, legal wording, 404 copy, and service-worker precache.

## Verification

- Clean clone: `/tmp/pvl-polish2-clean.Miyqgm/repo` at implementation commit
  `0d3256f12cee8fbafdc856eaf8575935b7cc010b`.
- `npm ci`: pass, 0 vulnerabilities.
- All 16 exact claim commands: pass independently.
- `npm test`: pass, 4/4 unit and 35/35 browser tests. Two additional consecutive
  working-tree runs also passed, including the formerly intermittent voice import.
- `npm run typecheck`, `npm run lint`, `npm run build`: pass.
- Output: `dist/`; JS 29.74 kB raw / 10.46 kB gzip; CSS 12.03 kB raw / 3.44 kB gzip.
- Accessibility/privacy/offline: Playwright axe zero serious/critical issues in
  both themes; same-origin privacy and offline demo claims pass; 390 px and 200%
  text-size checks pass; reduced motion, keyboard, focus, and touch targets pass.
- Local URL verifier: pass with no console errors, one h1, `lang=en`, main, and
  complete image alt text.
- Lighthouse local mobile: 100 Performance / 100 Accessibility / 100 Best
  Practices / 100 SEO; LCP 1.5 s, CLS 0, TBT 10 ms.
- Pushed commit `745d22d9a23193343357fbf2225edd358522f071` and deployed it through the static
  work-order configuration. Deployment ID:
  `791190d0-7e31-492e-9766-5aad553baafa`.
- Cold production checks passed demo entry/isolation/reset/exit, spoken fixture
  hash and duration, offline recall, focus after 4.3 seconds, 200% text sizing,
  route titles/canonicals/status, legal links, same-origin traffic, and 404.
- Production axe: zero serious/critical issues on root, demo, Privacy, Terms,
  and 404. Production Lighthouse: 100 / 100 / 100 / 100; LCP 1.1 s, CLS 0,
  TBT 0 ms. The live URL verifier reported no console errors.
- Evidence and finding map: `.factory/polish-2.md` and
  `.factory/evidence/polish-2/`.

## Run it

```sh
npm ci
npm test
npm run test:claims
npm run typecheck
npm run lint
npm run build
```

Demo: <https://personal-vocab-loop.sociobot.in/?demo=1>.

## Known gaps

None found. All review-1 and review-2 findings are mapped in
`.factory/polish-2.md` with automated, screenshot, and live evidence.
