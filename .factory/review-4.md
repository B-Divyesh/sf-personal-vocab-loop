# Adversarial review 4 — Personal Vocab Loop

**Verdict: FAIL**  
**Reviewed:** 2026-09-05 UTC  
**Live site:** <https://personal-vocab-loop.sociobot.in>  
**Implementation candidate:** `0d3256f12cee8fbafdc856eaf8575935b7cc010b`  
**Documentation baseline:** `5fb7d97052cea8dec07c4fcd2660a9078ea9ec8f`

There is **one major finding** and **zero untested claims**. The product works
end to end, but it does not meet the explicit plain-words requirement because
metaphorical and mood labels remain in the live interface.

## First screen before scrolling

Fresh Chromium contexts were opened at 390×844 and 1440×900 with no reused
site data.

| Question | Answer visible before scrolling | Result |
| --- | --- | --- |
| What is the job? | “Practice the phrases you want to say.” | Clear; the job-naming h1 is seven words. |
| Who is it for? | “For language learners who want their own phrases to return when speaking.” | Clear. |
| What should I do first? | “Try it with sample data” | Clear; the outcome note says the demo has three phrases and a spoken Spanish cue. |
| Does the title name the job? | “Personal Vocab Loop — practice personal phrases” | Yes; 48 characters. |

At 390 px, the h1 ended at y=255, actions at y=450, and the three facts at
y=610 in an 844 px viewport. Document width was exactly 390 px. The same
content was visible before scrolling at 1440×900.

## Finding

### F-4-1 — Metaphorical and mood labels remain in the interface (major)

- **Live evidence:** the first text above the otherwise clear h1 is **“YOUR
  PRIVATE LANGUAGE LAB.”** Capture uses **“NEW SIGNAL,”** an empty Recall view
  uses **“RECALL CLEAR,”** and Settings says **“Choose the signal treatment
  that is easiest on your eyes.”**
- **Source:** `src/main.ts`, in `libraryView()`, `captureView()`,
  `reviewView()`, and `settingsView()`.
- **Contract conflict:** the plain-words contract forbids metaphor, mood
  headings, invented brand lore, and decorative labels. “Language lab” and
  “signal” describe the visual theme rather than the user's task. “Recall
  clear” is a mood label rather than a section name. The existing
  `.factory/copy-audit.md` also omits these visible fragments while concluding
  that the copy has no metaphor problem.
- **Impact:** the job, audience, and action are still understandable, so this
  is not a broken workflow. It remains a release finding because the
  controller explicitly identified the first-screen phrase and the contract
  requires plain words on every page.
- **Required repair:** remove the decorative first-screen label or replace it
  with a factual label such as “Personal phrase practice.” Use “New phrase,”
  “No phrases due,” and “Choose the colour theme…” on the other routes. Update
  the copy audit to include all visible labels.

## Demo sandbox

- One click from `/` opened `/?demo=1` with three populated phrases in
  Spanish, French, and Japanese. The Spanish item had a visible, working voice
  cue.
- The banner remained present on the library and Settings routes and read
  **“Demo — sample data, nothing is saved.”** It included **Reset demo** and
  **Start for real**.
- Deleting a sample changed the count from 3 to 2. Reset restored 3. The
  library h1 retained focus immediately and 4.3 seconds after Reset.
- A sentinel captured in the fresh context's real database remained after
  demo mutation and Reset. Start for real returned to that sentinel and left
  the demo database with zero phrases.
- The live demo flow contacted only
  `personal-vocab-loop.sociobot.in` and produced no console or page errors.
- After Privacy and Terms were visited online, `/demo` reopened offline and
  Recall revealed the Spanish sentence. The demo banner remained present.

## Declared claims

From a clean clone at `/tmp/pvl-review4-clean.0WUrGL/repo`, `npm ci` installed
the documented dependencies with zero reported vulnerabilities. Every exact
command in `.factory/claims.json` was then run separately.

| Claim ID | Result |
| --- | --- |
| `demo-isolation` | PASS |
| `offline-reload` | PASS |
| `local-only` | PASS |
| `account-free` | PASS |
| `free-core` | PASS |
| `no-analytics` | PASS |
| `microphone-on-action` | PASS |
| `license-restore` | PASS |
| `csv-export` | PASS |
| `encrypted-export` | PASS |
| `backup-roundtrip` | PASS |
| `backup-merge-newest` | PASS |
| `recording-limit` | PASS |
| `demo-voice-cue` | PASS |
| `recall-schedule` | PASS |
| `pwa-update` | PASS |

Landing, legal, Settings, and README statements were cross-checked against the
manifest. No missing, false, incomplete, or untested public claim was found.
The plain-copy defect in F-4-1 is not a product claim.

## Normal, invalid, boundary, and recovery paths

- Normal capture, persistence, recall reveal/grading, audio playback, CSV,
  JSON, encrypted backup, merge import, and license restoration are covered by
  the passing full and claim suites.
- Live whitespace-only phrase and sentence input stayed on Capture, focused
  Phrase, and reported “Enter a phrase, not only spaces.”
- Live input at the exact 90-character phrase, 500-character sentence, and
  40-character tag limits saved successfully in the demo database.
- A malformed live import reported “This backup file is invalid. Choose a JSON
  backup exported by Personal Vocab Loop and try again.” The file control
  remained enabled. Wrong-passphrase retry and import-busy navigation are
  covered by the passing browser suite.
- Keyboard Tab reached the skip link; Enter focused `main`; Enter opened
  Recall; Space revealed the answer. There was no keyboard trap.

## Accessibility, routes, privacy, and PWA

- Factory `verify-url.sh` passed the live root: HTTP 200, title, `lang=en`, one
  h1, one main landmark, no missing alt text, no unlabeled buttons, and no
  console errors.
- Playwright Axe WCAG 2 A/AA scans found zero violations on `/`, Capture,
  Recall, Settings, every demo route, Privacy, Terms, `/404/`, and an unknown
  route. The full suite also checks both colour themes, 44 px controls, nav
  spacing, and 200% text size.
- Reduced motion produced no hero animation. Live keyboard route changes and
  delayed notice clearing retained the intended focus.
- All discovered internal links across the app, legal pages, and 404 page
  returned 200. The deliberate unknown route returned HTTP 404 with the styled
  “This phrase could not be found” page and working recovery links.
- Privacy and Terms have route-specific titles, one h1, the standard header,
  main, footer, and contact links. Demo traffic was same-origin only. The only
  optional external request is documented license verification to
  `api.sociobot.in`.
- A 40-request invalid-license check returned 30 HTTP 200 and 10 HTTP 429;
  every 429 carried `Retry-After: 4`. This is a static PWA, so tenant storage,
  backend restart persistence, and backend health checks do not apply.
- Live offline navigation and recall passed after legal-page visits. The
  isolated `pwa-update` claim also passed.

## Performance and deployment identity

- `npm run build` produced `dist/`. App JavaScript is 29,740 bytes raw / 10.46
  kB gzip, CSS is 12,031 bytes raw / 3.44 kB gzip, and the hero WebP is 27,418
  bytes.
- A clean Lighthouse 12.8.2 mobile run scored Performance 100,
  Accessibility 100, Best Practices 100, and SEO 100; LCP was 1.2 s, CLS 0,
  and TBT 0 ms.
- Fresh build hashes matched live for `index.html`, the hashed JS and CSS,
  `sw.js`, `manifest.webmanifest`, and `voice-orbit.webp`. The live runtime is
  therefore implementation candidate `0d3256f12cee8fbafdc856eaf8575935b7cc010b`.
  Commits after it through documentation baseline
  `5fb7d97052cea8dec07c4fcd2660a9078ea9ec8f` changed reports/evidence only and
  did not require another product image.

## Earlier finding disposition

Every earlier review, verification, polish report, and handoff was read. The
current disposition was proved from live behavior, source, or a fresh test.

| Earlier finding | Current disposition and evidence |
| --- | --- |
| Verification 1: broken checkout | Closed by removing the unavailable purchase action and price claim. No checkout link/request exists; existing-license restore remains tested. The endpoint still returns 404, but it is no longer an advertised path. |
| Verification 1: missing rate limit | Closed. Current 40-request check produced 30×200 and 10×429; every 429 had `Retry-After: 4`. |
| Verification 1: stale PWA update | Closed. `@claim:pwa-update` passed against the old-to-current worker simulation. |
| Verification 1: whitespace input | Closed. Live invalid input stayed on Capture, focused Phrase, and gave the recovery message. |
| Verification 1: distorted/below-fold mobile hero | Closed. The image remains square; job, actions, and facts fit at 390×844 with no overflow. |
| Verification 1: undersized mobile controls | Closed. The full browser suite's target and spacing checks passed. |
| Verification 1: prematurely visible hidden forms | Closed. The browser suite confirmed encrypted forms remain hidden until triggered. |
| Verification 1: response/caching hardening | Closed. Live CSP, permissions, frame, referrer, COOP/CORP, immutable hashed assets, HTML revalidation, manifest MIME, and no-store worker were confirmed. |
| Verification 2: missing claims contract | Closed. The manifest contains 16 claims and all 16 exact commands passed independently. |
| Verification 2: missing isolated demo | Closed. One-click sample, persistent label, separate namespace, Reset, exit clearing, and real-data sentinel all passed live. |
| Verification 2: broken advertised checkout | Closed through honest scope reduction as above; no purchase action or public price remains. |
| Verification 2: missing 404 | Closed. Unknown live URL returned the designed 404 response. |
| Verification 2: raw import error | Closed. Live malformed import gave a plain recovery instruction. |
| Verification 2: unstable performance | Closed. Current clean mobile Lighthouse scored 100 performance with 1.2 s LCP and 0 CLS. |
| Verification 3: legal-page offline cache poisoning | Closed. Legal pages were visited before going offline; `/demo` still loaded and Recall worked. |
| Verification 3: incomplete/flaky claims gate | Closed. All exact commands passed; schedule covers 1/3/7/14/30, merge-newest and decrypt round-trip are separate passing claims. |
| Verification 3: unreliable Lighthouse floor | Closed by the current clean 100 score and small bundles. |
| Verification 3: route focus/title loss | Closed. Route titles are specific and navigation/notice tests retained heading focus. |
| Verification 3: wrong-passphrase retry | Closed. The passing full suite retries in place with the control focused. |
| Verification 3: incomplete legal/404 skeleton | Closed. Live route matrix confirmed metadata, header, main, footer, skip link, and canonical on each page. |
| Review 1 F-1-1–F-1-5 | Closed. Delayed focus, exact schedule timing, recording privacy, 9.999/10-second boundary, and spoken demo cue all passed their dedicated checks. |
| Review 1 F-1-6–F-1-12 | Closed. PWA/purchase/host/version/policy overclaims remain removed; privacy section and 404 canonical remain present. |
| Review 1 F-1-13–F-1-19 | Closed. Phrase terminology and README explanations remain repaired. F-4-1 is a distinct metaphor-copy omission. |
| Review 2 F-1-5, F-1-13, F-2-1 | Closed. Spoken fixture, phrase terminology, and import completion behavior passed. |
| Review 2 F-2-2–F-2-9 | Closed. Free-core claim, removed scope promise, direct README language, license wording, deployment wording, and Recall terminology remain repaired. |
| Verification 4 and Review 3 PASS conclusions | Superseded only by F-4-1: their functional evidence remains reproducible, but they overlooked the metaphor labels. |

## Quality-gate results

- `npm ci` — PASS; zero reported vulnerabilities.
- All 16 exact claim commands — PASS independently.
- `npm test` — PASS; Vitest 4/4 and Playwright 35/35.
- `npm run typecheck` — PASS.
- `npm run lint` — PASS.
- `npm run build` — PASS; `dist/` produced.
- Live `verify-url.sh` — PASS.
- Live Axe route matrix — zero violations.

## Release decision

**FAIL.** Finding count: **1**. Untested claim count: **0**. Remove or rewrite
the metaphor/mood labels in F-4-1, update the copy audit, deploy that product
change, and rerun the live first-read check before declaring PASS.
