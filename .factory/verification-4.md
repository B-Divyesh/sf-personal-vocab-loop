# Personal Vocab Loop — independent verification 4

## Verdict: PASS

Verified on 2026-08-28 UTC from a clean checkout at candidate
`63eb5ff0ca35a371dddf23688be1e0b4027d5daf` against
<https://personal-vocab-loop.sociobot.in/>. No product code was changed.
Fresh local `dist/` matches the deployed `index.html`, `sw.js`, manifest,
hashed JS, and hashed CSS byte-for-byte.

## Mandatory first-read and demo gate: PASS

A cold desktop load clearly states:

- **What it does:** “Practice the phrases you want to say.”
- **For whom:** “For language learners who want personal words to return when
  speaking.”
- **What to click first:** the visible one-click **Try it with sample data**
  link, alongside the real “Capture your first phrase” action.

The sample action opens `/demo` with three realistic phrases and the persistent
“Demo — sample data, nothing is saved” banner, plus Reset demo and Start for
real controls. At 390×844 the heading and sample action are visible above the
fold and the page has no horizontal overflow.

## Claims gate: PASS

`.factory/claims.json` is present and has 14 entries. I ran every exact
declared command from the clean installed checkout, then ran the complete
tagged set together. All 14 tagged tests passed through the demo entry point:

`demo-isolation`, `offline-reload`, `local-only`, `account-free`,
`no-analytics`, `microphone-on-action`, `license-restore`, `csv-export`,
`encrypted-export`, `backup-roundtrip`, `backup-merge-newest`,
`recording-limit`, `recall-schedule`, and `pwa-update`.

The combined invocation `npx playwright test --grep '@claim:'` completed
**14/14 passed** in 23.4 seconds. The initial individual run encountered an
occupied local preview port left by a concurrently completing full-suite
process; after that process exited, the exact commands ran cleanly. This was
verified as test-process overlap, not a product or claim failure.

## Local build and automated checks: PASS

- `npm ci`: completed; npm audit reported 0 vulnerabilities.
- `npm test`: Vitest 4/4 and Playwright 30/30 passed.
- `npm run typecheck`: passed.
- `npm run lint`: passed (`tsc --noEmit`).
- `npm run build`: passed and produced `dist/`.
- Initial JS: 28,426 bytes raw / 10.10 kB gzip; CSS: 11,701 bytes raw /
  3.37 kB gzip; hero WebP: 27,418 bytes. These are within applicable static
  budgets.

## Live product exercise: PASS

In fresh browser contexts I confirmed the live demo has three samples; captured
“auf jeden Fall” with a personal German sentence and tag; exported CSV
containing that phrase; rejected a malformed JSON import with a recovery
message; opened blind recall, revealed the sentence, and exposed the recall
grade controls. The demo flow contacted only
`https://personal-vocab-loop.sociobot.in` and produced no console or page
errors.

Whitespace validation, encrypted-backup retry, 10-second recording limit,
backup merge, the full 1/3/7/14/30-day schedule, and microphone-on-action are
covered by the passing browser claim suite. There is no sign-in flow, so an
Entra authority check is not applicable.

## Accessibility, responsive behavior, and performance: PASS

- Live Axe WCAG 2 A/AA checks had zero serious/critical findings on the root,
  demo recall, and light-theme Settings; the local browser matrix also covers
  both Settings themes. Factory `verify-url.sh` passed live: HTTP 200 in
  834 ms, `lang=en`, one `h1`, one `main`, no missing alt text, no unlabeled
  buttons, and no console errors. Its JSON and screenshots are in
  `.factory/evidence/verification-4/verify-url-live/`.
- Keyboard: Tab reaches the skip link and Enter moves focus to `main`; the
  reduced-motion hero animation is `none`.
- At 390px, document width is exactly 390px; heading y=140 and sample action
  y=322 are within the 844px viewport.
- Fresh live mobile Lighthouse 12.8.2: Performance **100**, Accessibility
  **100**, LCP **1,426 ms**, CLS **0**, total transferred bytes **17,113**.

## Privacy, PWA, response policy, and deployment: PASS

- The live PWA registered and controlled its service worker, cached its module
  shell, and reloaded `/demo` offline with all three samples and recall usable.
  A separate live run visited Privacy and Terms before going offline, then
  reopened `/demo` and entered recall successfully. The passing local
  `@claim:pwa-update` simulates an old worker upgrading to this release.
- Live responses use CSP restricted to self plus the explicit Sociobot billing
  origin, HSTS, `nosniff`, strict referrer policy, frame denial, COOP/CORP, and
  `Permissions-Policy: microphone=(self)`. HTML revalidates, hashed assets are
  one-year immutable, and `sw.js` is no-store. Privacy, Terms, manifest,
  robots, sitemap, and styled 404 returned their expected statuses.
- The product’s only optional server call is Sociobot license verification.
  A 40-request rapid invalid-token check returned 30 HTTP 200 and 10 HTTP 429;
  the first observed 429 was request 3 and included `Retry-After: 4`. The
  mixed ordering reflects concurrent gateway handling, but rate limiting is
  confirmed.
- No analytics, advertising, tracker, CDN font, or other third-party runtime
  request was observed in the demo flow. License verification targets only
  `api.sociobot.in`; no Azure/OpenAI endpoint is present.

## Deployment identity

| Artifact | SHA-256 |
| --- | --- |
| `index.html` | `695a2b6369f606945ff45d572c3d42bccca05d6636b35f2589a6655a87c39f2f` |
| `sw.js` | `b51b293b83d89deb1917c6562b0c75651d5060e425b99a8854bf7d1ed937b568` |
| `manifest.webmanifest` | `709265a5547011cc8e54f0f511b57d40630d1d131b7bf4f0535fd43f03b0d50a` |
| `assets/app-nNGZrmuj.js` | `2544b565e2a835b1a551604aafdeb0b9ec6cf575c291bb8b4f76093310a65663` |
| `assets/index-a0OnH9hp.css` | `18873e72da510f0160a89df1cf99101347dacebf7fa06950f37d2412f8302fb3` |

## Defects by severity

No release-blocking, high, medium, or low product defects were found in this
verification.
