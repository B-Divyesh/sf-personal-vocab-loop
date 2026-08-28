# Personal Vocab Loop — repair 3 handoff

## Status: release blockers repaired and deployed

Verifier commit `42dac4447990b647a6b404897188553bda8c0b13` reported
against candidate `6e9bb71733a31837eba076bd19b966ca35c0cdd7`. The repaired
static offline-first PWA was committed as `deafb7e` and `de5fe2c`, pushed to
`origin/main`, and deployed to
<https://personal-vocab-loop.sociobot.in/> on 2026-08-28 UTC. Azure Static Web
Apps deployment ID: `7b44719e-6d21-49ae-84ce-f60fd51fe4b4`.

## Finding disposition

1. **Legal navigation no longer poisons the offline shell.** Navigation
   responses are cached under their own request. Only known app routes fall
   back to the precached app shell. The offline claim now visits both Privacy
   and Terms before going offline, reopening `/demo`, and completing recall.
2. **The claims gate is release-safe.** Playwright starts a strict, fresh
   preview server with a 120-second startup allowance. All 14 manifest commands
   passed independently on their first repair run. Every manifest ID appears
   on exactly one browser test.
3. **Claim proofs now match their copy.** The schedule test checks stored 1, 3,
   7, 14, and 30-day intervals. A new `backup-merge-newest` claim imports older
   and newer versions of one ID and proves the newest wins without duplication.
   The encrypted-export claim now clears the sample library, decrypts with the
   correct passphrase, and proves all three samples return.
4. **Mobile performance is stable above the release floor.** The worker install
   shell now contains only `index.html`, the hashed JS/CSS, and the 27,418-byte
   hero. It no longer downloads legal pages and unused install icons on first
   load. Two local and two live Lighthouse 12.8.2 mobile runs all scored 100
   Performance, 100 Accessibility, 100 Best Practices, and 100 SEO.
5. **App views preserve navigation context.** Library, Capture, Loop, and
   Settings now use `/`, `/capture`, `/loop`, and `/settings`; demo equivalents
   live under `/demo/*`. History back/forward works. Each transition updates
   title, description, canonical and social metadata, focuses the new `h1`, and
   announces it through a polite live region. Old hash links are upgraded.
6. **Encrypted-import retry stays operable.** A wrong passphrase keeps the
   decrypt form visible, focuses its passphrase field, retains the selected
   encrypted data in memory, and explains both retry choices. The regression
   retries successfully without selecting the file again.
7. **Secondary pages use the product skeleton.** Privacy, Terms, and 404 now
   include the skip link, branded header/navigation, main landmark, footer,
   build ID, descriptions, social metadata, favicon, Apple touch icon, focus
   treatment, reduced-motion rule, and 44px interactive targets. `/demo`
   receives route-specific metadata at runtime.

## Verification evidence

- Clean install: `npm ci` installed 57 packages; audit found 0 vulnerabilities.
- Unit/integration: Vitest 4/4 passed.
- Browser: Playwright 1.58.2 passed 30/30 tests at the final source state.
  Coverage includes capture/recall, validation, persistence, import/export,
  microphone behavior, demo isolation, offline legal-route recovery, prior-PWA
  upgrade, real routing/focus/announcements, 390px targets, reduced motion,
  privacy requests, dark/light axe, 404 behavior, metadata, and bundle budgets.
- Claims: all 14 exact `.factory/claims.json` commands passed independently;
  tag-to-manifest cardinality is 14/14 with exactly one test per ID.
- Static gates: `npm run typecheck`, `npm run lint`, and `npm run build` pass.
- Build: `dist/index.html` exists. Initial JS is 28,430 bytes raw / 10.10 kB
  gzip; CSS is 11,700 bytes raw / 3.37 kB gzip; hero WebP is 27,418 bytes.
- Factory URL verifier, local: HTTP 200, 559 ms, correct title and language,
  one `h1`, one `main`, no missing alt text, no unlabeled buttons, no console
  errors. Live: the same checks passed in 776 ms with no console errors.
- Axe/reflow matrix: zero serious/critical findings on all four app views, all
  four demo views, Privacy, Terms, and 404 at 1440×900 and 390×844. No tested
  page overflowed horizontally. All visible mobile controls measured at least
  44×44 CSS pixels.
- Keyboard: Tab exposes the 3px focus ring; the skip link focuses `main`; Enter
  on Settings opens `/settings`, sets the title, focuses its `h1`, and announces
  the view. Browser Back returns focus to the Library `h1`. The `N` and Space
  shortcuts continue to work.
- Privacy: a fresh live demo flow contacted only
  `https://personal-vocab-loop.sociobot.in`; no analytics, trackers, remote
  fonts, or third-party runtime scripts loaded.
- Offline/update: after controlled visits to `/demo`, Privacy, and Terms, a
  390px browser went offline, reopened `/demo`, showed all three samples, and
  entered recall at `/demo/loop`. The old-release-to-new-release worker upgrade
  test also passed.
- Live Lighthouse runs: both were 100/100/100/100. Run 1: FCP 1,102 ms, LCP
  1,207 ms, TBT 0 ms, CLS 0. Run 2: FCP 1,114 ms, LCP 1,208 ms, TBT 0 ms,
  CLS 0. Raw reports and URL-verifier screenshots are in
  `.factory/evidence/repair-3/`.
- Response policy: live CSP, frame denial, `nosniff`, strict referrer policy,
  COOP/CORP, HSTS, and microphone-only Permissions Policy are present. Hashed
  assets return one-year immutable caching; `sw.js` is `no-store`; HTML
  revalidates; the manifest uses `application/manifest+json`; unknown routes
  return the styled document with HTTP 404.
- Billing verifier policy: a live 220-request invalid-token burst returned 30
  HTTP 200 responses then 190 HTTP 429 responses. The first 429 was index 30,
  and every limited response had `Retry-After: 4`.
- Package/consumer, backend concurrency, and sign-in checks do not apply to this
  static, account-free PWA.

## Deployment identity

Local `dist/` and live SHA-256 values match exactly:

| Artifact | SHA-256 |
| --- | --- |
| `index.html` | `695a2b6369f606945ff45d572c3d42bccca05d6636b35f2589a6655a87c39f2f` |
| `sw.js` | `b51b293b83d89deb1917c6562b0c75651d5060e425b99a8854bf7d1ed937b568` |
| `manifest.webmanifest` | `709265a5547011cc8e54f0f511b57d40630d1d131b7bf4f0535fd43f03b0d50a` |
| `assets/app-nNGZrmuj.js` | `2544b565e2a835b1a551604aafdeb0b9ec6cf575c291bb8b4f76093310a65663` |
| `assets/index-a0OnH9hp.css` | `18873e72da510f0160a89df1cf99101347dacebf7fa06950f37d2412f8302fb3` |
| `privacy/index.html` | `d33e4387edcff00f0cbefa27ef292d1326a4f7a502bdb5f7568f1680d538e7a2` |
| `terms/index.html` | `bf457442e35996fd0b1dcb279225ad2c32045cf17c60ae1d183feaf6ed6fe0f0` |
| `404/index.html` | `844f262d3b528631584f7c042e94d57ef0571557a73480bd773177958ed06c96` |

## Run locally

```sh
npm ci
npm run typecheck
npm run lint
npm test
npm run build
npm run preview
```

Run any exact claim command from `.factory/claims.json`, for example:

```sh
npx playwright test --grep @claim:offline-reload
```

## Known gaps

No release-blocking gap remains from verification 3. New Plus purchases remain
honestly paused because the external Sociobot catalog has no enabled checkout
for this slug. Existing-license restore remains available and tested. This is
unchanged from the accepted scope of candidate 6e9bb71.
