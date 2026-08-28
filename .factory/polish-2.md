# Polish round 2 — cumulative adversarial repairs

Implementation commit: `0d3256f12cee8fbafdc856eaf8575935b7cc010b`.
Product URL: <https://personal-vocab-loop.sociobot.in>.

Every row below includes its specific automated or source check. The associated
production URL check is recorded in `live/cold-check.json` or
`live/routes-and-links.json`. Its visual evidence is `live/landing-mobile.png`,
`live/demo-mobile.png`, or `live/recall-mobile.png` under
`.factory/evidence/polish-2/`. README-only findings use the source copy audit;
their corresponding shipped wording was rechecked at the live root.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Kept notices in the persistent live region so their timer never replaces route DOM or focus. | `clearing a demo notice does not replace the focused route heading`; clean full suite; `local-demo-mobile.png`. |
| F-1-2 | Retained the single `reviewedAt` instant for `nextReview`, `lastReviewed`, and `updatedAt`. | `@claim:recall-schedule`; isolated clean-clone command and three consecutive full-suite passes. |
| F-1-3 | Retained the identifiable fake recording and separate-database/network assertions. | `@claim:local-only` from the clean clone. |
| F-1-4 | Retained the controlled-clock 9,999 ms/10,000 ms boundary assertions. | `@claim:recording-limit` from the clean clone. |
| F-1-5 | Replaced the two-tone sound with a 3.29-second spoken Spanish WAV. It is synthetic speech with documented provenance, text, duration, and SHA-256. | `@claim:demo-voice-cue`; `assets/src/sample-spanish-cue.wav.json`; `local-demo-mobile.png`; manual source-text/provenance check. |
| F-1-6 | Kept PWA jargon and unlisted installability wording out of the README. | README copy audit in `.factory/copy-audit.md`. |
| F-1-7 | Kept the unsupported purchase-status sentence removed; Settings only explains existing-license restoration. | `@claim:license-restore`; Settings copy review. |
| F-1-8 | Described the required app-page fallback and included headers instead of promising support on any static host. | README copy audit; `static host policy hardens responses…`. |
| F-1-9 | Kept the unlisted asset/versioning promise out of public copy. | README claim cross-check; `@claim:pwa-update` covers the observable update outcome. |
| F-1-10 | Kept the unlisted production-policy assertion out of public copy. | README claim cross-check; static configuration unit test. |
| F-1-11 | Retained a dedicated limits/privacy section on the landing page. | `local-landing-mobile.png`; axe/URL verification. |
| F-1-12 | Retained the canonical URL on the designed 404 and updated its wording/version. | `unknown paths return the styled 404 document`; metadata route test. |
| F-1-13 | Standardized the saved object as “phrase” in populated library, search, capture label, error, actions, and documentation. | `populated library and capture use phrase and recall terminology`; `local-demo-mobile.png`. |
| F-1-14 | Kept storage-engine jargon out of the README introduction. | README copy audit. |
| F-1-15 | Kept every export described by its result: restore, spreadsheet, or passphrase protection. | README copy audit; CSV/JSON/encrypted export claims. |
| F-1-16 | Kept demo isolation before the technical namespace detail. | README and `.factory/demo.md`; `@claim:demo-isolation`. |
| F-1-17 | Kept offline copy stated as a visitor outcome. | `@claim:offline-reload`; README copy audit. |
| F-1-18 | Replaced “SPA routes” with the concrete `index.html` fallback behavior. | README copy audit. |
| F-1-19 | Kept privacy copy in plain words: no downloaded fonts or code from other sites. | `@claim:no-analytics`; README copy audit. |
| F-2-1 | Added a visible importing state, `aria-busy`, route blocking, and a completion message. Voice-backup navigation now waits for that message. | `backup import announces progress and blocks route changes until storage completes`; `@claim:demo-voice-cue`; repeated full suites. |
| F-2-2 | Rewrote the first-screen fact as “Capture, recall, and export for free · no account” and added the missing free claim. | `@claim:free-core` and `@claim:account-free`, each isolated from the clean clone; `local-landing-mobile.png`. |
| F-2-3 | Removed the unlisted translation/course promise from landing and legal copy while retaining the privacy/limits section. | Landing/Terms copy cross-check; `local-landing-mobile.png`. |
| F-2-4 | Replaced “phone-friendly” with a direct description of who the product serves. | README copy audit; 390 px + 200% text-size browser test. |
| F-2-5 | Replaced “verified configuration” with the factual statement that the repository includes an Azure configuration. | README copy audit. |
| F-2-6 | Replaced “realistic” with the three named languages and one spoken Spanish cue. | README and demo docs; fixture hash/duration assertion. |
| F-2-7 | Replaced “private shuffle” everywhere with “the option to shuffle due phrases.” | `@claim:license-restore`; Settings, Privacy, Terms, and README copy cross-check. |
| F-2-8 | Replaced “SPA routes” with “sends app-page requests to `index.html`.” | README copy audit. |
| F-2-9 | Standardized the visible retrieval session as “Recall,” including nav, demo title, empty state, exit link, and shuffle control. | terminology browser test; route metadata test; `local-recall-mobile.png`. |

## Local and clean-clone evidence

- Clean clone: `/tmp/pvl-polish2-clean.Miyqgm/repo` from implementation commit.
- All 16 exact `.factory/claims.json` commands: pass independently.
- `npm test`: 4/4 unit and 35/35 browser tests; the working tree also passed two consecutive full runs.
- `npm run typecheck`, `npm run lint`, `npm run build`: pass; `dist/` produced.
- Build sizes: app JavaScript 29.74 kB raw / 10.46 kB gzip; CSS 12.03 kB raw / 3.44 kB gzip.
- Playwright axe: zero serious/critical findings in both themes; URL verifier: no console errors, one h1, `lang=en`, main landmark, no missing alt.
- Lighthouse local mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.5 s, CLS 0, TBT 10 ms.
- Screenshots: `.factory/evidence/polish-2/local-landing-mobile.png`, `local-demo-mobile.png`, `local-recall-mobile.png`.

## Live evidence

- Factory static deployment `791190d0-7e31-492e-9766-5aad553baafa` completed
  from pushed commit `745d22d9a23193343357fbf2225edd358522f071`.
- A cold 390 px context confirmed the first-screen wording/action with zero
  overflow. At 200% text size, horizontal overflow also remained zero.
- `/?demo=1` opened directly with the persistent banner, three phrases,
  “Phrases that sound like you,” and the phrase-only search vocabulary.
- The live IndexedDB cue is `audio/wav`, 3.289 seconds, and has the documented
  SHA-256. Playback was activated from the visible control.
- Reset retained h1 focus immediately and after 4.3 seconds. Recall settled at
  `/demo/loop` with title “Demo recall — Personal Vocab Loop” and “Leave recall.”
- Live demo isolation passed: delete changed 3→2, Reset restored 3, Start for
  real exposed the real sentinel, and cleared the demo database to 0.
- Fresh service-worker context reopened `/demo` offline and revealed the sample
  sentence in Recall.
- Root, Capture, Recall, Settings, every demo route, Privacy, Terms, `/404`, and
  an unknown URL had correct titles, one h1/main, canonicals, and expected status.
  Every discovered internal link returned 200; the unknown URL returned 404.
- The URL verifier reported no console errors. Axe found zero serious/critical
  issues on root, demo, Privacy, Terms, and 404. All observed traffic was
  same-origin.
- Lighthouse production mobile: Performance 100, Accessibility 100, Best
  Practices 100, SEO 100; LCP 1.1 s, CLS 0, TBT 0 ms.
- Evidence: `.factory/evidence/polish-2/live/` (`cold-check.json`,
  `routes-and-links.json`, screenshots, verifier output, and Lighthouse JSON).
