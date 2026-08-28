# Personal Vocab Loop — handoff

## Delivered

- Offline, installable PWA with a hand-written versioned service worker,
  manifest, 192/512 icons, and offline app-shell coverage.
- Local IndexedDB phrase library: word, personal sentence, context tag,
  optional 10-second MediaRecorder voice cue, search, deletion confirmation,
  and keyboard paths (`N` to capture; Space reveals a review answer).
- Transparent active-recall loop: 1, 3, 7, 14, and 30-day returns, with an
  honest “need another pass” path that returns tomorrow.
- JSON, CSV, and AES-GCM/PBKDF2 passphrase-encrypted local exports; imported
  backups merge by newest update. No user data is transmitted.
- One-time $12 Plus license flow through the Sociobot API contract: checkout,
  URL token capture, daily background verification, offline optimistic cached
  unlock, restore-token form, and a non-core shuffled recall order unlock.
- Pixel/demoscene visual system and original Azure-generated illustration;
  details and provenance are in `.factory/design.md`.

## Verification

- `npm test` passes: 2 scheduling unit assertions, capture-to-blind-recall
  browser flow, offline reload after service-worker install, and axe WCAG 2 A/
  AA serious/critical check (0 violations).
- `npm run build` passes and produces `dist/index.html` at the required root.
- Production bundle: JS **7.35 KB gzip** (20.17 KB raw), CSS **3.07 KB gzip**
  (10.14 KB raw), generated hero WebP **27 KB** — all under budget.
- A direct Lighthouse CLI run was attempted with the installed Playwright
  Chromium but the runner did not return a report in this container. The
  automated axe run and browser/offline tests are included instead; run a
  mobile Lighthouse audit in deployment before release.

## Known gaps / next steps

- Browser storage can be cleared by the user or OS; the app explains this and
  provides backups, but cannot prevent it.
- Voice recording depends on browser MediaRecorder/microphone availability.
- There are no local notifications in v1; phrase readiness is visible whenever
  the app is opened, intentionally avoiding pressure mechanics.
