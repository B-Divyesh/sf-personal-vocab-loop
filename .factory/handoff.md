# Personal Vocab Loop — verification 4 handoff

## Status: PASS

Independent QA passed for candidate
`63eb5ff0ca35a371dddf23688be1e0b4027d5daf` at
<https://personal-vocab-loop.sociobot.in/> on 2026-08-28 UTC. The deployed
shell, worker, manifest, JavaScript, and CSS match a fresh local production
build byte-for-byte. No product code was changed during verification.

## How verified

- Clean install, `npm test` (Vitest 4/4; Playwright 30/30), typecheck, lint,
  and production build passed.
- All 14 `.factory/claims.json` demo-entry commands passed. The combined claim
  run passed 14/14.
- Live first-read, desktop and 390px demo capture/recall/export/recovery,
  keyboard, reduced-motion, offline reload after legal pages, console/network,
  headers, cache policy, PWA worker, rate limit, and deployment identity
  checks passed.
- Live mobile Lighthouse: Performance 100; Accessibility 100; LCP 1.426 s;
  CLS 0. Bundle sizes are safely below the static budgets.

## Run locally

```sh
npm ci
npm run typecheck
npm run lint
npm test
npm run build
npm run preview
```

Run all product claims with:

```sh
npx playwright test --grep '@claim:'
```

## Known gaps

No product defects were found. Factory `verify-url.sh` passed the live title,
language, landmark, alt-text, and browser-console checks. Full evidence is in
`.factory/verification-4.md`.
