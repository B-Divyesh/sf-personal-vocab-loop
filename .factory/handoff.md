# Personal Vocab Loop — repair handoff

## Status

Release-blocking findings from verifier commit `44a01ec68b977a7fca7b9bb7bc7c33fe1bcb273a`
against candidate `52d13a373085104cc457f707709ca61ac73fad02` are repaired locally.
The artifact remains a static, offline-first PWA with `dist/index.html` at its root.

## Finding disposition

1. **Claims contract:** added `.factory/claims.json` with 13 observable claims.
   Every entry has exactly one `@claim:<id>` browser test, and every listed
   command passed independently from a fresh browser context.
2. **One-click demo:** the landing screen now names language learners and links
   to `/demo`. It opens three realistic phrases in one click. Demo storage is
   `demo:personal-vocab-loop`, separate from `personal-vocab-loop`. A persistent
   banner provides **Reset demo** and **Start for real**; exit clears demo data.
   `.factory/demo.md` documents the contract.
3. **Broken checkout:** the unavailable $12 checkout and purchase claim were
   removed from the product, legal copy, and README. Existing Plus customers can
   still restore and verify licenses. A mocked contract test confirms restored
   licenses expose private shuffle. New purchases remain honestly paused because
   the external Sociobot catalog has no enabled product for this slug; the brief
   does not require a paid tier.
4. **404:** Azure SWA now uses a 404 response override with a styled document.
   The production-preview regression asserts `/not-a-real-route` returns HTTP
   404, while explicit `/demo` routing and static assets remain reachable.
5. **Import recovery:** malformed JSON now reports that the file is invalid,
   identifies the required export type, and tells the user to try again.
6. **Performance variance:** the repaired local production build scored 100 in
   Lighthouse mobile performance, accessibility, best practices, and SEO. LCP
   was 1.5 s, FCP 1.0 s, TBT 60 ms, and CLS 0.

## Verification evidence

- Clean install: `npm ci` installed 57 packages with 0 vulnerabilities.
- Unit/integration: Vitest 4/4 passed.
- Browser: Playwright 1.58.2 passed 25/25 tests. Coverage includes desktop,
  390×844 mobile, keyboard skip/focus and shortcut use, dark/light axe scans,
  reduced motion, touch targets, capture/recall, validation, import recovery,
  real 404 status, privacy requests, demo isolation, all exports, microphone
  timing, offline reload, and old-to-new service-worker upgrade.
- Claims: all 13 `.factory/claims.json` commands passed independently.
- Static checks: `npm run typecheck` and `npm run lint` passed.
- Build: `npm run build` passed. Initial JS is 25,777 B raw / 9.31 kB gzip;
  CSS is 11,691 B raw / 3.37 kB gzip; the hero is 27,418 B. These are well
  under the 200 kB JS, 50 kB CSS, and 300 kB hero budgets.
- URL verifier on local production output returned HTTP 200, load 579 ms,
  correct title and `lang`, one `h1`, one `main`, no missing alt text, no
  unlabeled buttons, and no console errors.
- Manual screenshots at 1440×1000 and 390×844 showed no horizontal overflow.
  The mobile landing job, both actions, three facts, and square art render in
  the intended order. Demo mobile shows the persistent sandbox banner.
- Local artifact SHA-256: index `82a03b1a…f7fb3`; worker
  `3812b80b…d76ee65`; JS `ebaaaac5…d1e112`; CSS `4768e639…b0ee68`.
- Package/consumer verification is not applicable to this static PWA.

## Run locally

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run preview
```

Run one claim exactly as the verifier will:

```sh
npx playwright test --grep @claim:demo-isolation
```

## Deployment and known gaps

Deployment target: `https://personal-vocab-loop.sociobot.in` using
`/opt/fleet/lib/deploy-static.sh personal-vocab-loop dist`.

Live deployment identity, headers, offline behavior, 404 status, accessibility,
and Lighthouse evidence will be appended after deployment. No package-consumer
check applies. The only external limitation is that new Plus sales stay paused
until the factory registers and enables the product in the Sociobot catalog.
