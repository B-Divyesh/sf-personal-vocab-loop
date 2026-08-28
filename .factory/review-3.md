# Adversarial first-read review 3 — Personal Vocab Loop

**Verdict: PASS**  
**Reviewed:** 2026-08-28 UTC  
**Live site:** <https://personal-vocab-loop.sociobot.in>  
**Source reviewed:** `1e45c2ebbf77d78b08c304fc7ceceb49113d025d`

There are no blocking, major, minor, or untested-claim findings. This review was run from scratch rather than as a diff review.

## First 30 seconds

Fresh Chromium contexts were used before scrolling at 390×844 and 1440×900.

| Check | Result | Evidence on the first screen |
| --- | --- | --- |
| What does it do? | Clear | “Practice the phrases you want to say.” |
| For whom? | Clear | “For language learners who want their own phrases to return when speaking.” |
| What should I click first? | Clear | Visible primary action: “Try it with sample data.” |

At 390 px the headline, audience, action, action outcome, and three plain facts were visible without scrolling. The first-read gate passes.

## Copy audit

Counts use the same rule throughout: contractions, hyphenated terms, URLs, and numerals each count as one word. No landing or README sentence exceeds 22 words. No banned marketing adjective, unexplained user-facing jargon, terminology conflict, contextless heading, or non-result-naming action was found. “Unlock and import” is literal decryption language, not promotional language.

### Landing page

| Sentence or copy line | Words | Flag |
| --- | ---: | --- |
| Practice the phrases you want to say. | 7 | — |
| For language learners who want their own phrases to return when speaking. | 12 | — |
| See three sample phrases and hear a spoken Spanish cue. | 10 | — |
| Works offline after the first visit. | 6 | — |
| Your phrases stay on this device. | 6 | — |
| Capture, recall, and export for free · no account. | 8 | — |
| Write the phrase in a sentence you would actually use. | 10 | — |
| Say it once; save a voice cue of up to 10 seconds. | 11 | — |
| Recall it after 1, 3, 7, 14 and 30 days. | 10 | — |
| It has no account, ads, or tracking. | 8 | — |
| Your phrases and recordings stay in this browser. | 8 | — |
| Read the privacy details. | 4 | — |
| Made for phrases from your life. | 6 | — |
| Original generated illustration. | 3 | — |
| Built by Param Factory. | 4 | — |

Headings “How recall works” and “What this does not do” make sense when read out of context. Actions name an outcome: “Try it with sample data,” “Capture your first phrase,” “Reset demo,” and “Start for real.”

### README

| Sentence | Words | Flag |
| --- | ---: | --- |
| Personal Vocab Loop helps language learners practise phrases from their own lives. | 12 | — |
| Capture a phrase and a sentence from your life. | 9 | — |
| Add a voice cue of up to 10 seconds, then recall it after 1, 3, 7, 14 and 30 days. | 20 | — |
| Capture, recall, and export are free. | 6 | — |
| No account is required. | 4 | — |
| Phrases and recordings stay in private storage in this browser. | 10 | — |
| Download a backup you can restore, a CSV for spreadsheets, or a backup protected by a passphrase. | 17 | — |
| Existing Plus license holders can restore the option to shuffle due phrases. | 12 | — |
| Open `http://localhost:5173/?demo=1` in development, or visit the live demo URL. | 9 | — |
| It starts with three sample phrases in Spanish, French, and Japanese, plus one spoken Spanish cue. | 16 | — |
| Demo changes stay in a separate browser database, so they cannot alter your library. | 14 | — |
| Its technical name is `demo:personal-vocab-loop`. | 5 | — |
| Reset demo restores the sample, and Start for real clears the demo database before opening the real library. | 18 | — |
| Deploy `dist/` to a static host that sends app-page requests to `index.html` and applies the included headers. | 18 | — |
| The repository includes an Azure Static Web Apps configuration. | 9 | — |
| After the first online visit, the app can open without a connection. | 12 | — |
| The app uses no analytics, ads, trackers, downloaded fonts, or code from other sites. | 14 | — |
| Microphone permission is requested only when recording. | 7 | — |
| See Privacy and Terms. | 4 | — |
| The claim tests are listed in `.factory/claims.json`. | 7 | — |
| The researched scope and visual system are recorded in `.factory/`. | 10 | — |

The terminology remains consistent: **phrase**, **library**, **voice cue**, **recall**, **demo**, and **backup**.

## Demo and sandbox

The one-click action opened `/?demo=1` and immediately showed three used phrases: Spanish work, French friends, and Japanese music. The Spanish item included the replayable spoken sentence. The persistent banner read **“Demo — sample data, nothing is saved”** and exposed both **Reset demo** and **Start for real**.

In a fresh context, deleting one sample changed the visible count from 3 to 2; Reset restored 3 and the voice-cue control. Recall immediately showed the product in use and revealed the sample sentence. The source selects `demo:personal-vocab-loop` before any demo reads/writes; `discardDemo()` clears that store on exit. The declared isolation claim also creates a real-store sentinel and proves demo mutation/reset/exit do not alter it.

After a first online visit and service-worker control, a live offline `/demo` load still entered Recall and revealed “Me llevo bien con la gente de mi nuevo equipo.” The exercised demo flow made requests only to `https://personal-vocab-loop.sociobot.in`; no console or page errors occurred.

## Claims and local quality gates

A fresh local clone at `/tmp/pvl-review3-clean.4WioYq/repo` installed with `npm ci` and built `dist/`. Every exact command in `.factory/claims.json` completed successfully, independently, for all 16 claim IDs:

`demo-isolation`, `offline-reload`, `local-only`, `account-free`, `free-core`, `no-analytics`, `microphone-on-action`, `license-restore`, `csv-export`, `encrypted-export`, `backup-roundtrip`, `backup-merge-newest`, `recording-limit`, `demo-voice-cue`, `recall-schedule`, and `pwa-update`.

The clean clone also passed `npm test`, `npm run typecheck`, `npm run lint`, and `npm run build`. The built app JavaScript was 29.74 kB raw / 10.46 kB gzip.

Landing and README claims were cross-checked against the manifest: offline, local-only storage, account-free/free core, no analytics, microphone timing, licensing, exports, voice-cue duration/sample, and recall schedule each have an entry and a tagged observable test. No unlisted visitor-facing claim was found.

## Earlier findings: confirmed fixed

Read and rechecked `.factory/review-1.md`, `.factory/review-2.md`, `.factory/polish-1.md`, `.factory/polish-2.md`, prior verification reports, and the prior handoff. Each earlier finding was confirmed in both live behavior and source/tests:

| Earlier IDs | Confirmation |
| --- | --- |
| F-1-1 | The timeout only updates persistent `#notice-status`; Reset retains focused route-heading position after the notice clears. |
| F-1-2, F-1-3, F-1-4 | The schedule uses one review instant; recording privacy and the 9,999/10,000 ms boundary are exercised in tagged tests. |
| F-1-5 | The seed contains the original spoken Spanish WAV and visible replay control. |
| F-1-6–F-1-19 | README/landing wording, demo isolation explanation, dedicated privacy limits, 404 canonical, terminology, and tested privacy/offline copy remain repaired. |
| F-2-1–F-2-9 | Import busy/recovery behavior, free-core wording/test, non-promissory scope copy, direct language, license wording, static-host wording, and Recall terminology remain repaired. |

## Structure, accessibility, and visual identity

Live checks covered `/`, Capture, Recall, Settings, all four demo routes, Privacy, Terms, `/404`, and an unknown route. App routes use route-specific title, description, canonical, Open Graph/Twitter metadata, favicon, apple-touch icon, one `h1`, one `main`, skip link, header, and footer. Back navigation restores an `h1` focus target and the polite route announcement. The unknown route returned HTTP 404 with the designed page and useful way back; the intentional `/404` document returned its static page. Every root-page internal link returned HTTP 200.

The midnight pixel/demoscene terminal, original voice-crystal art, stepped cards, cyan/yellow/coral signal palette, and reduced-motion orbital treatment match `.factory/design.md` and are product-specific rather than a generic SaaS template. The brief does not imply an AI step: capture, voice cues, spaced recall, and import/export work locally; adding AI would be decorative. No provider key or runtime AI feature is present.

## Findings

None.

## What would make this perfect

No product change is required from this review. Continue to run all 16 independent claim commands and the full suite before a future release, especially after changes to offline routing, sample data, or browser storage.
