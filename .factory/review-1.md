# Adversarial first-read review 1 — Personal Vocab Loop

**Verdict: FAIL**  
**Reviewed:** 2026-08-28 UTC  
**Live site:** <https://personal-vocab-loop.sociobot.in>  
**Source:** `c415d7f378bd97b9c4714c90ed175e48811859c2`

There are five blocking findings, six major findings, and eight minor findings. A passing full suite does not cancel the independently observed claim-test failure or the live focus regression.

## First 30 seconds, before scrolling

Fresh Chromium contexts were used at 390×844 and 1440×900.

| Question | Mobile answer | Desktop answer | Result |
| --- | --- | --- | --- |
| What does this do? | It saves phrases I want to say and brings them back for recall practice. | Same. | Clear |
| For whom? | Language learners practising words from their own lives. | Same. | Clear |
| What should I click first? | **Try it with sample data**, the filled primary action. | Same. | Clear |

The first-screen copy was “Practice the phrases you want to say.” and “For language learners who want personal words to return when speaking.” Both requested actions and all three facts were visible without scrolling. The first-read gate itself passes.

## Findings

### Blocking

#### F-1-1 — A route-change notice drops keyboard focus after four seconds

- **Quote/location:** live `/demo/settings` → **Reset demo**; `src/main.ts`, `showNotice()`: `window.setTimeout(() => { notice = ''; render(); }, 4000)`.
- **Observed:** Reset first moved focus to the new “Words that sound like you” `<h1>`. After 4.3 seconds, `document.activeElement` changed from `H1` to `BODY` because clearing the toast re-rendered the entire app.
- **Why this blocks:** the prior route-focus defect is only half-fixed. A keyboard or screen-reader user loses the announced route position after an unrelated timer. The same rendering pattern can discard focus after other status-producing actions.
- **Concrete fix:** update only a persistent live-region node when a notice appears or clears. Do not replace the focused route DOM. Add a browser test that activates Reset, verifies heading focus immediately, waits beyond the notice timeout, and verifies focus is still meaningful.

#### F-1-2 — The recall-schedule claim test is intermittent and failed as written

- **Quote/location:** `.factory/claims.json`, `recall-schedule`: “Phrases return on a 1, 3, 7, 14 and 30-day schedule.” `e2e/claims.spec.ts:262` requires `toBe(1)`.
- **Observed:** the exact command failed once with `Expected: 1`, `Received: 0.999999988425926`. It later passed in the full suite, five repeats, and the clean-clone run.
- **Why this blocks:** the contract says any failing claim test is blocking. The failure is real test nondeterminism: `nextReviewAt(stage)` and `lastReviewed: new Date()` use different instants.
- **Concrete fix:** create one `reviewedAt` value in `grade()`, pass it to `nextReviewAt(stage, reviewedAt)`, and store the same ISO value as `lastReviewed`. Keep the exact interval assertion, then repeat the isolated command enough times to establish stability.

#### F-1-3 — The local-only claim does not test its recording promise

- **Quote/location:** `.factory/claims.json`: “Your phrases and recordings stay on this device.” The tagged test at `e2e/claims.spec.ts:56` enters text only and never creates a recording.
- **Why this blocks:** the privacy test proves the phrase text stays same-origin but leaves the recording half of the public claim untested. A user cannot rely on the full statement from this evidence.
- **Concrete fix:** install a fake `MediaRecorder`, record a non-empty identifiable audio blob, save it, and assert throughout the flow that no outbound request contains the phrase or audio marker. Also confirm the blob exists only in the selected IndexedDB namespace.

#### F-1-4 — The 10-second claim test does not perform its declared boundary check

- **Quote/location:** `.factory/claims.json`, `recording-limit` sandbox: “assert recording at 9.999 seconds and stopped at 10 seconds.” The test at `e2e/claims.spec.ts:208` checks that a 10,000 ms callback was registered, then calls the callback directly.
- **Why this blocks:** the listed sandbox procedure is not executed, so the quantitative boundary is not fully tested.
- **Concrete fix:** use a controllable clock, advance to 9,999 ms and assert the recorder remains active, then advance 1 ms and assert it stopped and attached the cue.

#### F-1-5 — The demo omits the product's voice-cue differentiator

- **Quote/location:** live `/demo`; all three sample cards say **“No voice cue.”** `.factory/demo.md` documents only sentences and context tags.
- **Why this blocks:** the landing page and brief feature personal voice cues, but the one-click sample shows none. The demo is realistic for phrase recall but weak for the complete promised product experience.
- **Concrete fix:** ship at least one short, original sample recording with a visible **Play voice cue** control. Confirm playback, Reset, demo isolation, offline use, and backup round trips in claim tests.

### Major

#### F-1-6 — “PWA” is both jargon and an unlisted installability claim

- **Quote/location:** README opening: “Personal Vocab Loop is a language-practice PWA for learners.”
- **Why this matters:** a learner may not know the acronym, and calling it a PWA implies installability that has no corresponding claim entry.
- **Concrete fix:** write “Personal Vocab Loop is a phone-friendly practice app for language learners.” If installability is important, add an `installable-app` claim and browser test for the manifest, icons, worker, and installability criteria.

#### F-1-7 — The purchase-status statement is an unlisted claim

- **Quote/location:** README: “New purchases are paused.”
- **Why this matters:** this is a current commercial-state promise with no `.factory/claims.json` entry.
- **Concrete fix:** add a claim test that confirms Settings exposes no purchase action or checkout request, or remove the sentence and explain restoration only where the existing-license control appears.

#### F-1-8 — Static-host compatibility is unlisted and overbroad

- **Quote/location:** README: “Deploy the contents of `dist/` to any static host.”
- **Why this matters:** “any” includes hosts that do not provide the SPA rewrites, 404 behavior, MIME types, or headers this build expects.
- **Concrete fix:** use “Deploy `dist/` to a static host configured for the included SPA routes and headers,” then name the verified host configuration.

#### F-1-9 — The asset/versioning sentence makes unlisted implementation claims

- **Quote/location:** README: “The build emits content-hashed app assets and a matching content-versioned service worker, so an installed copy discovers every new release instead of remaining on a stale shell.”
- **Why this matters:** `pwa-update` tests the update outcome, but no listed claim asserts the hash/version relationship stated here. The sentence also exceeds the 22-word hard cap.
- **Concrete fix:** split and narrow it: “App files use versioned names. The service worker checks for a new version and updates the offline copy.” Extend `pwa-update` to assert both details, or keep only its currently tested outcome.

#### F-1-10 — The production-policy statement is not in the claims manifest

- **Quote/location:** README: “`public/staticwebapp.config.json` carries the production security, MIME, and cache policy for Azure Static Web Apps.”
- **Why this matters:** an untagged unit check exists, but the public README claim has no `.factory/claims.json` entry and no live-response assertion attached to it.
- **Concrete fix:** add a `response-policy` claim whose test checks deployed headers, manifest MIME type, HTML revalidation, immutable assets, and the 404 response; otherwise limit the sentence to what the file is intended to configure.

#### F-1-11 — The landing page omits the required privacy/limits section

- **Quote/location:** live `/`; the page ends after “How the recall loop works” and the footer.
- **Why this matters:** one hero fact says data stays on-device, but the standard skeleton requires a dedicated plain-language section explaining what the product does not do and how privacy works.
- **Concrete fix:** add a short section after “How the recall loop works,” for example: “What this does not do — It does not translate or teach a course. It has no account or tracking. Your phrases and recordings stay in this browser.” Link its privacy statement to the tested claim and Privacy page.

### Minor

#### F-1-12 — The designed 404 has no canonical URL

- **Quote/location:** live unknown route and `public/404/index.html`; `link[rel="canonical"]` is absent.
- **Why this matters:** every other route supplies the required canonical metadata, so the route metadata set is incomplete.
- **Concrete fix:** add a canonical for the designed `/404` document, or document and test an explicit no-canonical exception if that is the intended SEO policy.

#### F-1-13 — The saved-item terminology changes between “phrases” and “words”

- **Quote/location:** landing: “Practice the phrases…”, “personal words”, “Write the word…”, and footer “Made for your own words.” The repository terminology table says the saved learning item is **phrase**.
- **Why this matters:** the UI alternates labels for the same saved unit, which weakens the otherwise clear first read.
- **Concrete fix:** use **phrase** for the saved unit: “For language learners who want their own phrases to return when speaking,” “Write the phrase in a sentence…,” and “Made for phrases from your life.” Keep **word** only when it specifically means a single-word entry.

#### F-1-14 — “IndexedDB” is unexplained README jargon

- **Quote/location:** README: “Phrases and recordings stay in the browser's IndexedDB.”
- **Why this matters:** the storage engine name does not help a learner understand the privacy result.
- **Concrete fix:** write “Phrases and recordings stay in private storage in this browser.” Put the IndexedDB implementation detail in the developer or demo-storage paragraph.

#### F-1-15 — The export sentence names formats without explaining their result

- **Quote/location:** README: “JSON backups can restore the library. CSV and passphrase-encrypted exports are also available.”
- **Why this matters:** JSON and CSV are unexplained format names in the user-facing introduction.
- **Concrete fix:** write “Download a backup you can restore, a CSV for spreadsheets, or a backup protected by a passphrase.”

#### F-1-16 — The demo namespace sentence leads with implementation jargon

- **Quote/location:** README: “Demo changes use the separate `demo:personal-vocab-loop` database.”
- **Why this matters:** the important result is isolation; the namespace is supporting verifier detail.
- **Concrete fix:** write “Demo changes stay in a separate browser database, so they cannot alter your library. Its technical name is `demo:personal-vocab-loop`.”

#### F-1-17 — The offline sentence relies on unexplained platform terms

- **Quote/location:** README: “The manifest and service worker provide cached offline use after the first visit.”
- **Why this matters:** “manifest,” “service worker,” and “cached” describe implementation before the user result.
- **Concrete fix:** write “After the first online visit, the app can open without a connection.” Move the implementation terms to a developer note.

#### F-1-18 — The deployment-policy sentence is unnecessarily opaque

- **Quote/location:** README: “`public/staticwebapp.config.json` carries the production security, MIME, and cache policy for Azure Static Web Apps.”
- **Why this matters:** “MIME” and “cache policy” are not explained, and “carries” does not name an observable result.
- **Concrete fix:** write “For Azure Static Web Apps, the included config sets security headers, file types, caching, SPA routes, and the 404 page.”

#### F-1-19 — “Third-party runtime scripts” is privacy jargon

- **Quote/location:** README: “No analytics, advertising, trackers, remote fonts, or third-party runtime scripts are used.”
- **Why this matters:** a non-developer may not know what a runtime script is.
- **Concrete fix:** write “The app uses no analytics, ads, trackers, downloaded fonts, or code from other sites.”

## Complete copy audit

Counts treat hyphenated terms and URLs as one word, count numerals as words, and exclude standalone punctuation/list markers.

### Live landing page sentences and fragments

| Copy | Words | Flag |
| --- | ---: | --- |
| Practice the phrases you want to say. | 7 | — |
| For language learners who want personal words to return when speaking. | 11 | F-1-13 |
| Works offline after the first visit. | 6 | Tested claim |
| Your phrases stay on this device. | 6 | Tested claim |
| Free core loop · no account. | 5 | Tested claim |
| Write the word in a sentence you would actually use. | 10 | F-1-13 |
| Say it once; save a voice cue of up to 10 seconds. | 12 | F-1-4/F-1-5 |
| Recall it after 1, 3, 7, 14 and 30 days. | 10 | F-1-2 |
| Made for your own words. | 5 | F-1-13 |
| Original generated illustration. | 3 | Provenance is recorded in `.factory/design.md` |
| Built by Param Factory. | 4 | Required attribution |

Average: 7.2 words. No banned word appears and no landing sentence exceeds 22 words.

Headings and controls were also checked: “Your private language lab” (4), “How the recall loop works” (5), “Try it with sample data” (5), and “Capture your first phrase” (4). Both action labels are result-naming verbs. The two real headings make sense out of context. Navigation labels are Library, Loop, Settings, and Demo.

### README sentences

| Copy | Words | Flag |
| --- | ---: | --- |
| Personal Vocab Loop is a language-practice PWA for learners. | 9 | F-1-6 |
| Capture a word and a sentence from your life. | 9 | — |
| Add a voice cue of up to 10 seconds, then recall it after 1, 3, 7, 14 and 30 days. | 20 | F-1-4/F-1-5 |
| The core loop works without an account. | 7 | Tested claim |
| Phrases and recordings stay in the browser's IndexedDB. | 8 | F-1-3/F-1-14 |
| JSON backups can restore the library. | 6 | F-1-15; tested claim |
| CSV and passphrase-encrypted exports are also available. | 7 | F-1-15; tested claims |
| Existing Plus license holders can still restore private shuffle. | 9 | Tested claim |
| New purchases are paused. | 4 | F-1-7 |
| Open `http://localhost:5173/demo` in development, or visit `https://personal-vocab-loop.sociobot.in/demo`. | 7 | — |
| It starts with three realistic sample phrases. | 7 | Covered by demo-isolation |
| Demo changes use the separate `demo:personal-vocab-loop` database. | 7 | F-1-16; tested claim |
| Reset demo restores the sample, and Start for real clears the demo database before opening the real library. | 18 | Tested claim |
| Deploy the contents of `dist/` to any static host. | 9 | F-1-8 |
| The manifest and service worker provide cached offline use after the first visit. | 13 | F-1-17; tested outcome |
| The build emits content-hashed app assets and a matching content-versioned service worker, so an installed copy discovers every new release instead of remaining on a stale shell. | 27 | F-1-9; over 22 words |
| `public/staticwebapp.config.json` carries the production security, MIME, and cache policy for Azure Static Web Apps. | 14 | F-1-10/F-1-18 |
| No analytics, advertising, trackers, remote fonts, or third-party runtime scripts are used. | 12 | F-1-19; tested claim |
| Microphone permission is requested only when recording. | 7 | Tested claim |
| See Privacy and Terms. | 4 | — |
| The claim tests are listed in `.factory/claims.json`. | 7 | — |
| The researched scope and visual system are recorded in `.factory/`. | 10 | — |

Average: 10.0 words. The 27-word sentence is the only hard-cap failure. README headings — “Personal Vocab Loop,” “Try the isolated demo,” “Run and verify,” and “Privacy and product notes” — make sense out of context. The README contains no UI buttons.

## Demo and sandbox evidence

- One click from `/` opened `/demo` at both widths.
- The first demo screen showed three due phrases with personal sentences and context tags.
- The persistent banner contained the required message, **Reset demo**, and **Start for real**.
- In a fresh live context, deleting one phrase produced two cards; Reset restored three.
- A sentinel placed in `personal-vocab-loop` survived demo work. Start for real cleared `demo:personal-vocab-loop` to zero records and revealed the real sentinel.
- The complete live exercise made requests only to `https://personal-vocab-loop.sociobot.in` and produced no console errors.
- After visiting Privacy and Terms, the live demo reopened offline, entered Loop, and revealed the Spanish sample sentence.
- F-1-5 remains because all three samples omit voice audio.

## Claims results

All 14 exact manifest commands were run separately from a fresh local clone at `/tmp/pvl-review-clone.SJKRNc/repo`; all passed there. An earlier exact run from the clean source checkout exposed F-1-2. `npm test` subsequently passed Vitest 4/4 and Playwright 30/30.

| Claim | Required command result | Review note |
| --- | --- | --- |
| demo-isolation | PASS | Live isolation also confirmed |
| offline-reload | PASS | Live legal-page/offline flow also confirmed |
| local-only | PASS | Incomplete for recordings: F-1-3 |
| account-free | PASS | — |
| no-analytics | PASS | Same-origin live flow confirmed |
| microphone-on-action | PASS | — |
| license-restore | PASS | Mocked gateway response as declared |
| csv-export | PASS | — |
| encrypted-export | PASS | — |
| backup-roundtrip | PASS | — |
| backup-merge-newest | PASS | — |
| recording-limit | PASS | Declared 9.999-second check missing: F-1-4 |
| recall-schedule | **FAIL observed; later PASS** | Exact failure is blocking: F-1-2 |
| pwa-update | PASS | — |

Unlisted public claims are F-1-6 through F-1-10. Other landing and README behavior claims map to manifest entries.

## Structure, accessibility, and visual identity

- Route titles, one `<h1>`, descriptions, Open Graph/Twitter data, SVG favicon, 180×180 Apple icon, and the 1200×630 social image passed on listed routes. F-1-12 is the 404 canonical exception.
- Sitemap routes and every discovered same-origin navigational link returned the expected status. The designed unknown route returned 404. `mailto:` links were not fetched.
- Deep links loaded the correct state. Forward and back navigation focused the new `<h1>` after the route settled. F-1-1 covers the later timed regression.
- `verify-url.sh` passed the live root with no console errors. Axe CLI 4.11.4 found zero violations on the live root. The repository's broader axe tests passed both themes.
- The 390px page had no horizontal overflow, required first-screen copy was visible, reduced motion and target-size checks passed, and first-load JS was 28,426 bytes raw / 10.10 kB gzip.
- The pixel/demoscene “private memory terminal” identity is distinct, matches `.factory/design.md`, and does not resemble a generic SaaS hero/card template.
- The header/footer skeleton, Privacy/Terms routes, robots, sitemap, PWA metadata, CSP, and designed 404 are present. F-1-11 records the missing landing section.

## History check

No `.factory/review-*.md` or `.factory/polish-*.md` exists anywhere in repository history. The previous `.factory/handoff.md` claimed all checks passed and no gaps. Current live/code verification contradicts that conclusion through F-1-1 and F-1-2. Earlier verification reports were also read; the checkout removal, demo, offline cache, whitespace validation, responsive image, target size, import recovery, security headers, real routes, metadata, and service-worker update repairs remain present. The route-focus repair is incomplete as described in F-1-1.

## Missed leverage

No AI feature is warranted: generation or translation is not the core job, and adding it would weaken the local-first promise. Import, CSV export, restorable backup, and encrypted export already cover the obvious portability need. Sync would materially change the privacy model. No separate missed-leverage finding is added beyond making the existing voice feature demonstrable in F-1-5.

## Verification commands and outputs

- `npm ci` — pass, 0 reported vulnerabilities.
- Every exact `.factory/claims.json` command in a clean clone — 14/14 pass; separate clean-checkout observation in F-1-2 failed once.
- `npm test` — pass, Vitest 4/4 and Playwright 30/30.
- `npm run typecheck` — pass.
- `npm run lint` — pass.
- `npm run build` — pass; `dist/` produced.
- `/opt/fleet/lib/verify-url.sh https://personal-vocab-loop.sociobot.in /tmp/pvl-verify` — pass.
- Axe CLI 4.11.4 with matching Chrome/ChromeDriver — zero violations on `/`.
- Live cold-read, demo isolation/reset/exit, offline recall, route metadata/focus, and dead-link scripts — completed in fresh contexts.

## What would make this perfect

Resolve every finding above: keep focus stable through status updates, make the schedule claim deterministic, test recording privacy and the exact recording boundary, include a playable sample voice cue, enumerate or remove every README claim, rewrite the jargon and long sentence, add the missing privacy/limits section, standardise phrase terminology, and complete 404 metadata. Then rerun each claim command independently, the full suite, the live demo/offline flows, the delayed-focus reproduction, the crawl, `verify-url.sh`, and axe. A perfect next review has zero findings and no partially tested claim.
