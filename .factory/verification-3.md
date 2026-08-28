# Personal Vocab Loop — independent verification 3

## Verdict: FAIL

Verified on 2026-08-28 UTC from clean checkout commit
`6e9bb71733a31837eba076bd19b966ca35c0cdd7` against
<https://personal-vocab-loop.sociobot.in/>. `origin/main` resolved to the same
commit. The deployed files exactly match the candidate build, so the findings
below are candidate defects, not a stale or deployment-only failure. No product
code was changed.

## Release-blocking findings

### Critical — the offline claim is false after a normal legal-page visit

The service worker stores every successful navigation response under
`/index.html`. This allows a visit to `/privacy/` or `/terms/` to replace the
cached application shell. Fresh live reproduction:

1. Open `/demo`, wait for the service worker, and reload under its control.
2. Open `/privacy/` while online.
3. Go offline and navigate to `/demo`.
4. The URL is `/demo`, but the document title and `<h1>` are **Privacy —
   Personal Vocab Loop** and **Privacy**. There is no demo banner and no sample
   phrase.

Evidence: `evidence/verification-3/offline-cache-poisoning.txt`. This directly
contradicts “Works offline after the first visit” and the documented demo
contract. The listed claim test only covers an immediate `/demo` reload, so it
misses the corrupting navigation sequence.

### Critical — the claims gate is not release-safe

- During the mandated run of every `.factory/claims.json` command, the exact
  `@claim:offline-reload` command failed with exit 1 and
  `ERR_CONNECTION_REFUSED` at the local demo entry point. The exact command
  passed on an immediate standalone rerun, and the full suite later passed,
  identifying test-server flakiness rather than erasing the required-gate
  failure. The contract states that any failing claim command blocks release.
- The quantitative `recall-schedule` claim promises **1, 3, 7, 14, and 30**
  days, but its tagged test asserts only the 7-day transition. The separate
  unit test asserts only 1, 3, and 7 days. Neither claim test nor unit test
  proves 14 and 30 days.
- “Imported phrases merge by ID, keeping the newest version” is public Settings
  copy with no claim entry. `backup-roundtrip` restores deleted records; it
  does not exercise an older/newer ID conflict.
- The encrypted-export claim test checks a format marker and absence of sample
  plaintext, but does not prove that the file can be decrypted with the right
  passphrase. Independent live QA did prove that behavior, but the required
  claim command does not.

All 13 manifest IDs otherwise have exactly one matching `@claim:<id>` test.
Evidence: `evidence/verification-3/claims-run-summary.md`,
`claims-output.txt`, `claim-offline-rerun.txt`, and the claim source at
`e2e/claims.spec.ts:202-215`.

### High — mobile Lighthouse does not reliably meet the 90 floor

Two Lighthouse 12.8.2 mobile runs against the live root produced:

| Run | Performance | Accessibility | Best practices | SEO | LCP | TBT | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | **85** | 100 | 100 | 100 | 1.57 s | 589 ms | 0 |
| 2 | 96 | 100 | 100 | 100 | 1.36 s | 181 ms | 0 |

One run misses the required 90 performance score, so the target is not reliable
under repeated measurements. Evidence: `evidence/verification-3/lighthouse-*.json`
and `lighthouse-summary.txt`.

### High — view navigation loses keyboard and screen-reader context

Library, Capture, Loop, and Settings use hash routes rather than real page URLs.
After keyboard activation of Settings, the focused navigation link is destroyed
and `document.activeElement` becomes `<body>`; focus is not moved to the new
`<h1>` or main landmark, and there is no route announcement. The title also
remains “Personal Vocab Loop — practice personal phrases” for every app view.
This violates the required route focus/title behavior and makes keyboard and
screen-reader navigation ambiguous. Evidence:
`evidence/verification-3/live-browser-qa.txt`.

## Other findings

### Medium — wrong-passphrase recovery hides the control needed to retry

An incorrect encrypted-backup passphrase correctly reports “That passphrase did
not unlock this backup,” but rerendering hides `#decrypt-form` and clears the
file input. The error does not tell the user to select the backup again. A retry
works only after reselecting the file. Evidence:
`evidence/verification-3/encrypted-import-recovery.txt`.

### Medium — secondary routes omit the required site skeleton and metadata

`/privacy/`, `/terms/`, and the 404 document have no skip link, header/nav, or
footer. Privacy and Terms also have no description, canonical, Open Graph, or
Twitter metadata. `/demo` retains the root canonical and social metadata rather
than route-specific metadata. No page provides the required apple-touch icon,
and the app footer omits a version/build ID. Axe reports no serious/critical
violation on these documents, but they do not satisfy the site-structure
contract. Evidence: `evidence/verification-3/live-pages-links.txt`.

## Mandatory first-read and demo gate

**PASS.** A cold 1440×900 load says:

- What: “Practice the phrases you want to say.”
- For whom: “For language learners who want personal words to return when
  speaking.”
- First click: visible **Try it with sample data**.

The action opens `/demo` in one click with three realistic phrases and the
persistent “Demo — sample data, nothing is saved” banner. At 390×844, the
headline, audience, action, and all three facts are above the fold. Evidence:
`evidence/verification-3/live-cold-desktop.png`, `live-mobile-root.png`, and
`live-mobile-demo.png`.

## Build and automated gates

- Clean install: `npm ci` installed 57 packages; audit reported 0
  vulnerabilities.
- `npm test`: PASS — Vitest 4/4 and Playwright 25/25.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS (the repository defines lint as `tsc --noEmit`).
- Exact `npm run build`: PASS; `dist/` created.
- Initial app JS: 25,777 B raw / 9.31 kB gzip (budget 200 kB).
- CSS: 11,691 B raw / 3.37 kB gzip (budget 50 kB).
- Hero WebP: 27,418 B (budget 300 kB). No downloaded font files.

Evidence: `evidence/verification-3/npm-test.txt`, `typecheck.txt`, `lint.txt`,
and `build.txt`.

## Functional and boundary QA

Live, fresh-browser demo checks covered capture, persistence across reload,
search/no-result recovery, blind reveal, successful recall, deletion cancel and
confirm, reset, JSON/CSV/encrypted export, malformed import, wrong and correct
passphrases, microphone permission and recording, and exit to an empty real
library.

- Whitespace-only word and sentence values were rejected, focused, and given
  field-specific recovery messages.
- User typing was capped at 90-character phrase, 500-character sentence, and
  40-character tag boundaries; the exported backup contained the saved boundary
  record.
- Recall exposed the personal sentence only after reveal and advanced a stage-2
  sample by seven days.
- CSV had the documented header and one row per record. Encrypted output had the
  expected format and no sample plaintext. Correct-passphrase import recovered
  all three samples after the retry issue noted above.
- Demo reset restored three samples. Leaving demo cleared the demo store and
  opened an empty real library.

Evidence: `evidence/verification-3/live-functional-qa.txt` and
`encrypted-import-recovery.txt`.

## Accessibility, responsive behavior, and browser health

- Factory `verify-url.sh`: PASS — HTTP 200, title, `lang=en`, one `<h1>`, one
  `<main>`, no missing alt text, no unlabeled buttons, and no console errors.
- Axe: zero serious/critical WCAG 2 A/AA findings across Library, Capture, Loop,
  and Settings in both dark and light themes, and zero on Privacy, Terms, and
  404.
- Keyboard skip link receives a visible 3 px yellow focus outline and moves
  focus to main. The later route-focus failure is documented above.
- Reduced motion removes the hero animation and reduces transitions to 0.01 ms.
- At 390 px and 320 px there is no horizontal overflow. Tested visible controls
  were at least 44×44 px; the 390 px first screen contains the full required
  copy. No console or page errors appeared.

Evidence: `evidence/verification-3/verify-url/`, `axe-matrix.txt`,
`live-browser-qa.txt`, and the mobile/reflow screenshots.

## Privacy, security, networking, and rate limiting

- Demo app use contacted only the product origin. No analytics, trackers,
  remote scripts, or remote fonts were observed.
- Existing-license restore made the single expected GET to
  `https://api.sociobot.in/.../verify`; no sign-in flow exists.
- A 220-request concurrent invalid-license burst returned 30 HTTP 200 responses
  followed by 190 HTTP 429 responses. The first 429 was request index 30, and
  every 429 included `Retry-After: 3` or `4`. Observed threshold: **30 accepted
  rapid requests**.
- Live responses include CSP, HSTS, `nosniff`, frame denial, strict referrer,
  COOP/CORP, and microphone-only Permissions Policy. Hashed assets are immutable
  for one year; HTML revalidates; `sw.js` is `no-store`.
- Every discovered HTTP link returned 200; the designed unknown route returned
  404. `mailto:` links were exempt.

Evidence: `evidence/verification-3/live-license-flow.txt`, `rate-limit.txt`,
`live-pages-links.txt`, and the captured response headers in the verification
run output.

## PWA and deployment identity

Direct first-visit `/demo` offline reload and recall pass, and the
previous-worker-to-current-worker update claim passes locally. The manifest has
standalone display, versioned start URL, theme/background colors, and 192/512
icons marked `any maskable`. The legal-navigation cache corruption described
above remains release-blocking.

Local and live SHA-256 values match for all checked artifacts: `index.html`,
`sw.js`, manifest, hero, social preview, hashed JS/CSS, Privacy, Terms, and 404.
Evidence: `evidence/verification-3/deployment-identity.txt`,
`live-offline-rerun.txt`, and `claim-offline-rerun.txt`.

Package-consumer checks do not apply to this static PWA. Backend concurrency and
persistence checks do not apply; the only server endpoint used by the product
is the external Sociobot verification endpoint tested above.
