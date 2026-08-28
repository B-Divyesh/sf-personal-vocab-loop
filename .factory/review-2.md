# Adversarial first-read review 2 — Personal Vocab Loop

**Verdict: FAIL**  
**Reviewed:** 2026-08-28 UTC  
**Live site:** <https://personal-vocab-loop.sociobot.in>  
**Source:** `4ffc19582d367f05c448612673a6712721954909`

There are three blocking findings, four major findings, and four minor findings. The first screen is clear and the live sandbox is isolated, but one declared claim failed during the required full suite, the sample “voice” cue is a synthesized two-tone sound, and two earlier copy/demo findings remain only partly fixed. A passing isolated claim command does not cancel the observed full-suite claim failure.

## First 30 seconds, before scrolling

Fresh Chromium contexts were used at 390×844 and 1440×900. No storage or service worker state was reused.

| Question | Mobile answer | Desktop answer | Result |
| --- | --- | --- | --- |
| What does this do? | It saves personal phrases and brings them back for scheduled recall. | Same. | Clear |
| For whom? | Language learners practising phrases from their own lives. | Same. | Clear |
| What should I click first? | **Try it with sample data**. | Same. | Clear |

The exact first-screen text was “Practice the phrases you want to say.” and “For language learners who want their own phrases to return when speaking.” The primary action, its outcome note, and all three facts were visible without scrolling at both widths. On mobile, the primary action ended at 344 px and the last fact ended at 543 px within the 844 px viewport. This gate passes.

## Findings

### Blocking

#### F-1-5 — The earlier voice-demo repair is only partial

- **Quote/location:** landing and README: “See three sample phrases and a replayable voice cue.” Demo control: “Play voice cue.” `src/demo.ts:3-22` generates a 0.52-second WAV from 392 Hz and 523.25 Hz sine waves and explicitly calls it a “two-note cue.”
- **Observed:** the live button plays successfully, but the shipped sample contains two synthesized tones, not a person saying a phrase or sentence. The prior finding required the demo to demonstrate the product’s personal voice-cue differentiator with realistic sample data.
- **Why this blocks:** the one-click demo labels a tone as a voice cue. A visitor cannot hear what recording and replaying a personal phrase is like, so the differentiating part of the job remains undemonstrated. This is a half-fix of the earlier F-1-5 and therefore keeps the same ID.
- **Concrete fix:** ship an original, consented spoken sample, for example a speaker saying “Me llevo bien con la gente de mi nuevo equipo.” Record its provenance in `.factory/design.md`. Keep it in demo-only local storage, offline cache, Reset, and backup round trips. Test a stable fixture hash, non-zero duration, playback, Reset, and restored audio; retain one manual evidence note confirming that the fixture contains the documented speech.

#### F-1-13 — The saved item is still called both “word” and “phrase”

- **Quote/location:** live demo/library h1: “Words that sound like you”; search placeholder: “Search words, sentences, tags”; capture label: “Word or phrase.” The landing, cards, actions, README, and `.factory/copy-audit.md` call the saved item a “phrase.”
- **Why this blocks:** the first screen after entering the demo changes the name of the core object. Multi-word samples such as “llevarse bien” sit under a “Words” heading, contradicting the repository’s own terminology table. This is a half-fix of the earlier F-1-13 and therefore keeps the same ID.
- **Concrete fix:** use “phrase” for the saved object everywhere: “Phrases that sound like you,” “Search phrases, sentences, tags,” and “Phrase.” If single words are allowed, add helper copy: “A single word is fine.” Update the terminology check to scan populated library and capture views, not only the empty landing page.

#### F-2-1 — The demo-voice-cue claim failed in the required full suite

- **Quote/location:** `.factory/claims.json`, `demo-voice-cue`: “The sample demo includes a replayable voice cue”; `e2e/claims.spec.ts:305-307` selects the backup file and immediately navigates away.
- **Observed:** every manifest command passed when run separately from the clean clone. Later, `npm test` failed `@claim:demo-voice-cue` with “element(s) not found” for “Play voice cue for llevarse bien” after import; the other 31 tests passed. Ten isolated repeats and `npm run test:claims` later passed, confirming nondeterminism rather than cancelling the failure.
- **Why this blocks:** the contract makes any observed claim-test failure blocking. The test can leave Settings before asynchronous `file.text()`, IndexedDB replacement, and refresh complete, so it does not provide stable evidence for the backup-round-trip part of the claim.
- **Concrete fix:** after `setInputFiles`, wait for the visible “Imported 3 phrases into your library.” status before navigating. Add an in-product importing state that disables or safely completes navigation while import is pending. Re-run the exact isolated command and the full suite repeatedly from a clean clone.

### Major

#### F-2-2 — “Free core loop” is vague and its price claim is unlisted

- **Quote/location:** landing fact: “Free core loop · no account.” README: “The core loop works without an account.”
- **Why this matters:** `account-free` proves account-free capture, recall, and export, but no manifest entry says the product is free or checks for the absence of a payment gate. “Core loop” also makes the visitor infer which actions are included.
- **Concrete fix:** rewrite both locations as “Capture, recall, and export for free. No account.” Add a `free-core` claim test that completes those actions in real mode without a license, checkout, or payment request, or remove “free.”

#### F-2-3 — The no-translation/course statement is an unlisted claim

- **Quote/location:** landing limits section: “It does not translate or teach a course.”
- **Why this matters:** this is a scope promise a visitor can rely on, but `.factory/claims.json` has no matching entry.
- **Concrete fix:** either remove the sentence or add a `no-translation-course` claim whose test crawls every product route, asserts no translation/lesson action, and confirms no model or translation-service request occurs.

#### F-2-4 — “Phone-friendly” is an unlisted README claim

- **Quote/location:** README: “Personal Vocab Loop is a phone-friendly practice app for language learners.”
- **Why this matters:** an untagged 390 px layout test exists, but the public claim has no `.factory/claims.json` entry and therefore is not included in the claim contract.
- **Concrete fix:** add a `mobile-layout` entry and tag the existing 390 px test, including no horizontal overflow, visible first action, 44 px controls, and 200% text zoom; or rewrite as “Personal Vocab Loop helps language learners practise phrases from their own lives.”

#### F-2-5 — “Verified configuration” is an unlisted deployment claim

- **Quote/location:** README: “Azure Static Web Apps is the verified configuration.”
- **Why this matters:** “verified” promises deployment compatibility, but the claims manifest contains no deployed-response test for route rewrites, 404 behavior, MIME types, cache rules, or security headers. The existing untagged config-unit test checks the file, not the deployed result.
- **Concrete fix:** write “The repository includes an Azure Static Web Apps configuration,” or add a `static-host-config` claim with tests against a deployed preview for all named behavior.

### Minor

#### F-2-6 — “Realistic” is subjective marketing copy

- **Quote/location:** README: “It starts with three realistic sample phrases and a replayable voice cue.”
- **Why this matters:** “realistic” is not an observable description and the current audio is not a voice recording.
- **Concrete fix:** write “It starts with three sample phrases in Spanish, French, and Japanese, plus one spoken Spanish cue.” Apply the spoken-cue repair in F-1-5 before using that rewrite.

#### F-2-7 — “Private shuffle” does not name the result

- **Quote/location:** README: “Existing Plus license holders can restore private shuffle.”
- **Why this matters:** a first-time reader cannot tell whether “private” describes storage, a plan, or a shuffle mode.
- **Concrete fix:** write “Existing Plus license holders can restore the option to shuffle due phrases.” Use the same wording in Settings, Privacy, Terms, and the `license-restore` claim.

#### F-2-8 — “SPA routes” is unexplained README jargon

- **Quote/location:** README: “Deploy `dist/` to a static host configured for the included SPA routes and headers.”
- **Why this matters:** the deployment result is obscured by an acronym.
- **Concrete fix:** write “Deploy `dist/` to a static host that sends app-page requests to `index.html` and applies the included headers.”

#### F-2-9 — The retrieval session has three visible names

- **Quote/location:** header “Loop”; landing “How the recall loop works” and “Recall it”; `/loop` title “Recall phrases”; demo title “Demo review”; review link “Leave review.” `.factory/copy-audit.md` says the one term is “recall.”
- **Why this matters:** navigation, page title, and in-page copy do not use the same name for the same session.
- **Concrete fix:** choose “Recall” for the user-visible action: nav “Recall,” title “Recall phrases — Personal Vocab Loop,” demo title “Demo recall — Personal Vocab Loop,” and link “Leave recall.” Keep “loop” only in the product name if desired.

## Complete copy audit

Counts treat hyphenated terms, URLs, paths, and code identifiers as one word. Standalone punctuation is excluded. No sentence exceeds 22 words and no banned word appears.

### Live landing page

| Sentence or fragment | Words | Result |
| --- | ---: | --- |
| Practice the phrases you want to say. | 7 | Pass |
| For language learners who want their own phrases to return when speaking. | 12 | Pass |
| Works offline after the first visit. | 6 | Listed claim |
| Your phrases stay on this device. | 6 | Listed claim |
| Free core loop; no account. | 5 | F-2-2 |
| See three sample phrases and a replayable voice cue. | 9 | F-1-5/F-2-1 |
| Write the phrase in a sentence you would actually use. | 10 | Pass |
| Say it once; save a voice cue of up to 10 seconds. | 12 | Listed claim |
| Recall it after 1, 3, 7, 14 and 30 days. | 10 | Listed claim; F-2-9 terminology |
| It does not translate or teach a course. | 8 | F-2-3 |
| It has no account or tracking. | 6 | Listed claims |
| Your phrases and recordings stay in this browser. | 8 | Listed claim |
| Made for phrases from your life. | 6 | Pass |
| Original generated illustration. | 3 | Provenance recorded in `.factory/design.md` |
| Built by Param Factory. | 4 | Required attribution |

Average: 7.5 words.

Headings and result actions were checked separately. “Practice the phrases you want to say” is a seven-word job headline. “How the recall loop works” and “What this does not do” make sense out of context. “Try it with sample data,” “Capture your first phrase,” and “Read the privacy details” name their results. F-2-9 covers the remaining heading terminology issue. No landing action uses “Submit,” “Go,” or “Continue.”

### README

| Sentence | Words | Result |
| --- | ---: | --- |
| Personal Vocab Loop is a phone-friendly practice app for language learners. | 11 | F-2-4 |
| Capture a phrase and a sentence from your life. | 9 | Pass |
| Add a voice cue of up to 10 seconds, then recall it after 1, 3, 7, 14 and 30 days. | 20 | Listed claims |
| The core loop works without an account. | 7 | F-2-2; “core loop” is vague |
| Phrases and recordings stay in private storage in this browser. | 10 | Listed claim |
| Download a backup you can restore, a CSV for spreadsheets, or a backup protected by a passphrase. | 17 | Listed claims |
| Existing Plus license holders can restore private shuffle. | 8 | F-2-7 |
| Open `http://localhost:5173/?demo=1` in development, or visit `https://personal-vocab-loop.sociobot.in/?demo=1`. | 7 | Pass |
| It starts with three realistic sample phrases and a replayable voice cue. | 12 | F-1-5/F-2-1/F-2-6 |
| Demo changes stay in a separate browser database, so they cannot alter your library. | 14 | Listed claim |
| Its technical name is `demo:personal-vocab-loop`. | 5 | Verifier detail |
| Reset demo restores the sample, and Start for real clears the demo database before opening the real library. | 18 | Listed claim |
| Deploy `dist/` to a static host configured for the included SPA routes and headers. | 14 | F-2-8 |
| Azure Static Web Apps is the verified configuration. | 8 | F-2-5 |
| After the first online visit, the app can open without a connection. | 12 | Listed claim |
| The app uses no analytics, ads, trackers, downloaded fonts, or code from other sites. | 14 | Listed claim |
| Microphone permission is requested only when recording. | 7 | Listed claim |
| See Privacy and Terms. | 4 | Pass |
| The claim tests are listed in `.factory/claims.json`. | 7 | Repository fact |
| The researched scope and visual system are recorded in `.factory/`. | 10 | Repository fact |

Average: 10.7 words. Command-block comments are fragments, not sentences. README headings “Personal Vocab Loop,” “Try the isolated demo,” “Run and verify,” and “Privacy and product notes” make sense out of context.

### Terminology check

| Concept | Terms found | Result |
| --- | --- | --- |
| Saved learning item | phrase, word | F-1-13 |
| Saved collection | library | Consistent |
| Spoken attachment | voice cue | Consistent label, but sample content fails F-1-5 |
| Retrieval session | loop, recall, review | F-2-9 |
| Isolated sample mode | demo | Consistent |
| Portable restorable file | backup | Consistent |

## Demo and sandbox evidence

- One click from `/` opened `/?demo=1` at both widths.
- The first demo screen already showed three due phrases in Spanish, French, and Japanese, their personal sentences and tags, and a visible playback control.
- The persistent banner contained “Demo — sample data, nothing is saved,” **Reset demo**, and **Start for real**.
- Deleting one sample reduced the live card count from three to two; Reset restored three.
- A sentinel inserted into `personal-vocab-loop` survived all demo work. Start for real cleared `demo:personal-vocab-loop` to zero records and showed the real sentinel.
- After the service worker controlled the page, Privacy and Terms were visited online. With the browser context offline, `/demo` reopened, Loop worked, and the Spanish answer was revealed.
- The live flow contacted only `https://personal-vocab-loop.sociobot.in` and produced no console errors.
- The demo is structurally usable and isolated. F-1-5 blocks it because its advertised voice sample is a tone rather than speech.

## Claims results

The repository was cloned without local-object reuse to `/tmp/pvl-review2.YCHMFB/repo`, then `npm ci` was run. Every exact manifest command was executed separately.

| Claim | Exact command | Isolated result | Review result |
| --- | --- | --- | --- |
| demo-isolation | `npx playwright test --grep @claim:demo-isolation` | PASS | PASS |
| offline-reload | `npx playwright test --grep @claim:offline-reload` | PASS | PASS; live offline flow also passed |
| local-only | `npx playwright test --grep @claim:local-only` | PASS | PASS |
| account-free | `npx playwright test --grep @claim:account-free` | PASS | PASS; price wording remains unlisted in F-2-2 |
| no-analytics | `npx playwright test --grep @claim:no-analytics` | PASS | PASS |
| microphone-on-action | `npx playwright test --grep @claim:microphone-on-action` | PASS | PASS |
| license-restore | `npx playwright test --grep @claim:license-restore` | PASS | PASS |
| csv-export | `npx playwright test --grep @claim:csv-export` | PASS | PASS |
| encrypted-export | `npx playwright test --grep @claim:encrypted-export` | PASS | PASS |
| backup-roundtrip | `npx playwright test --grep @claim:backup-roundtrip` | PASS | PASS |
| backup-merge-newest | `npx playwright test --grep @claim:backup-merge-newest` | PASS | PASS |
| recording-limit | `npx playwright test --grep @claim:recording-limit` | PASS | PASS |
| demo-voice-cue | `npx playwright test --grep @claim:demo-voice-cue` | PASS | **FAIL in `npm test`**; F-2-1 |
| recall-schedule | `npx playwright test --grep @claim:recall-schedule` | PASS | PASS |
| pwa-update | `npx playwright test --grep @claim:pwa-update` | PASS | PASS |

`npm run test:claims` later passed 15/15, and ten isolated `demo-voice-cue` repeats passed. The earlier full-suite failure remains an observed failing claim test and exposes a real missing wait.

Unlisted claim-like copy is recorded individually in F-2-2 through F-2-5. Other landing and README behavior claims map to manifest entries.

## Historical finding verification

Every current `.factory/review-*.md`, `.factory/polish-*.md`, and the prior handoff was read. Each prior finding was checked on the live site and in source rather than accepted from the polish table.

| Earlier finding | Current verification |
| --- | --- |
| F-1-1 delayed focus loss | Fixed. Reset focused the library h1 immediately and after 4.3 seconds; `showNotice` updates the persistent status node without rendering. |
| F-1-2 schedule nondeterminism | Fixed. `grade()` uses one `reviewedAt`; isolated and full-suite schedule checks passed. |
| F-1-3 recording privacy test gap | Fixed. The test stores and inspects an identifiable fake recording in only the demo database. |
| F-1-4 9.999/10-second boundary gap | Fixed. The controlled-clock test asserts both boundaries. |
| F-1-5 missing voice demo | **Half-fixed; blocking again.** F-1-5 applies. |
| F-1-6 PWA jargon/unlisted install claim | Fixed. That wording is gone. F-2-4 is a different mobile claim introduced by the rewrite. |
| F-1-7 unlisted purchase-status statement | Fixed. The sentence is gone. |
| F-1-8 “any static host” overclaim | Fixed. “Any” was removed and host requirements are narrowed. |
| F-1-9 unlisted asset/version sentence | Fixed. The sentence is gone. |
| F-1-10 unlisted production-policy statement | Fixed. The old statement is gone. F-2-5 covers the new “verified configuration” claim. |
| F-1-11 missing limits/privacy section | Fixed. The live landing includes “What this does not do.” |
| F-1-12 missing 404 canonical | Fixed. Live unknown routes return 404 with canonical `/404`. |
| F-1-13 phrase/word terminology | **Half-fixed; blocking again.** F-1-13 applies. |
| F-1-14 IndexedDB jargon | Fixed in the README introduction. |
| F-1-15 unexplained export formats | Fixed. The introduction explains restore, spreadsheets, and passphrase protection. |
| F-1-16 demo namespace before result | Fixed. Isolation is stated before the technical name. |
| F-1-17 offline platform jargon | Fixed. The README now states the user outcome. |
| F-1-18 opaque MIME/cache prose | Fixed. The old sentence is gone; F-2-8 covers the new acronym. |
| F-1-19 “third-party runtime scripts” jargon | Fixed. The README says “code from other sites.” |

The prior handoff’s “Known gaps: None” is contradicted by F-1-5, F-1-13, and the observed `npm test` failure.

## Structure, accessibility, and visual identity

- `/`, `/capture`, `/loop`, `/settings`, all four demo routes, Privacy, Terms, `/404`, and an unknown URL were checked live. Titles were route-specific and at most 47 characters. Each route had one h1, a description, canonical, OG/Twitter metadata, SVG favicon, and 180 px Apple icon.
- The social image is 1200×630. The unknown URL returned HTTP 404 and used the designed “This phrase has left the loop” page.
- All intended same-origin links discovered across those routes returned 200. `mailto:` links were excluded. The deliberately unknown crawl seed returned 404 as expected.
- Deep links loaded their intended view. Navigation, browser Back, Reset, and delayed notice clearing kept focus on the new h1 and updated the polite route status.
- `/opt/fleet/lib/verify-url.sh` passed the live root with no console errors. Playwright axe scans found zero WCAG 2 A/AA violations on the root, demo, Privacy, Terms, and unknown-route 404.
- The 390 px root had no horizontal overflow, first actions and facts were visible, target-size/reduced-motion checks passed in the suite, and first-load JavaScript built to 10.49 kB gzip.
- Privacy and Terms appear in every footer; wordmark/header/footer treatment is consistent. Robots, sitemap, route rewrites, and security policy files are present.
- The pixel/demoscene memory-terminal palette, stepped cards, crystal/orbit art, and restrained orbit motion are distinct and match `.factory/design.md`. The page is not a generic centered-gradient SaaS template.

No additional structure or accessibility finding was observed.

## Missed leverage

No AI feature is justified. The brief’s job is personal capture and scheduled recall; generated translations or lessons would change that job and weaken the offline/local-first boundary. The product already includes CSV, restorable JSON, encrypted export, and merge import. Cloud sync would require a new privacy model. No missed-leverage finding is added beyond making the existing voice-recording feature genuinely demonstrable in F-1-5.

## Verification summary

- `npm ci` — PASS, zero reported vulnerabilities.
- Fifteen exact `.factory/claims.json` commands — PASS when isolated.
- `npm test` — **FAIL**, 31/32 browser tests passed; `@claim:demo-voice-cue` failed.
- `npm run test:claims` — PASS, 15/15 on a later run; does not erase the failure.
- `npm run typecheck` — PASS.
- `npm run lint` — PASS.
- `npm run build` — PASS; `dist/` produced, app JS 29.43 kB raw / 10.49 kB gzip.
- Live `verify-url.sh` — PASS.
- Live axe across root/demo/legal/404 — zero violations.
- Live cold read, sandbox isolation, Reset/exit, audio playback control, offline recall, route metadata, focus/back, and link crawl — completed in fresh contexts.

## What would make this perfect

Resolve every finding above. Replace the synthesized tone with a documented spoken phrase, make the voice-backup claim test wait for completed import and remain stable in the full suite, standardize “phrase” and “recall,” list or remove every unlisted claim, and replace subjective or unexplained README terms with the proposed copy. Then rerun every claim command, repeated full suites, live demo isolation/offline flows, the complete copy audit, route crawl, metadata/focus checks, `verify-url.sh`, and axe. A perfect next review has zero findings, zero unlisted claims, and no failed or unstable test.
