# Polish round 1 — adversarial review repairs

Repair commit: `3d779bf9c2eece15daffd401d7b1a804440fde80`.
Live deployment: <https://personal-vocab-loop.sociobot.in> (2026-08-28 UTC).

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Moved notices into persistent `#notice-status`; clearing a notice no longer renders the route. | `clearing a demo notice does not replace the focused route heading`; live reset focus check, `.factory/evidence/polish-1/live-reset-focus.png`. |
| F-1-2 | `grade()` now creates one `reviewedAt` instant for `nextReview`, `lastReviewed`, and update time. | `@claim:recall-schedule` passed independently from `/tmp/pvl-clean.NMXTaq/repo`. |
| F-1-3 | The privacy claim now uses a fake recorder with an identifiable blob and verifies it only in `demo:personal-vocab-loop`. | `@claim:local-only` passed independently from the clean clone. |
| F-1-4 | The recording test advances a controlled clock to 9,999 ms and then 10,000 ms. | `@claim:recording-limit` passed independently from the clean clone. |
| F-1-5 | Seeded the Spanish sample with an original local WAV cue; it plays, resets, works offline, and survives backup import. | `@claim:demo-voice-cue`, `@claim:offline-reload`, and `@claim:backup-roundtrip`; live `.factory/evidence/polish-1/live-demo-mobile.png`. |
| F-1-6 | Rewrote the README opening as a phone-friendly practice app; removed PWA jargon/installability wording. | README audit and clean-clone claim suite. |
| F-1-7 | Removed the unsupported purchase-status statement; restoration is explained only beside the existing-license control. | `@claim:license-restore` passed independently. |
| F-1-8 | Narrowed deployment instructions to a static host configured for included routes and headers. | README audit; Azure Static Web Apps live deployment. |
| F-1-9 | Removed the unlisted implementation/versioning promise. | README audit; `@claim:pwa-update` remains the tested update outcome. |
| F-1-10 | Removed the public production-policy assertion rather than presenting an untested header promise. | README audit; live headers checked in deployment evidence. |
| F-1-11 | Added the landing-page “What this does not do” privacy/limits section. | Live landing check and `.factory/evidence/polish-1/live-landing-mobile.png`. |
| F-1-12 | Added the canonical URL to the designed 404 document. | Live unknown URL returns 404 and contains `/404` canonical. |
| F-1-13 | Standardized the saved-item wording to “phrase” in landing, footer, and capture copy. | `.factory/copy-audit.md`; live landing screenshot. |
| F-1-14 | Replaced README storage-engine jargon with private browser storage. | README audit. |
| F-1-15 | Explained each export result in plain words. | README audit; `@claim:csv-export`, `@claim:backup-roundtrip`, and `@claim:encrypted-export`. |
| F-1-16 | Led demo docs with isolation before the technical namespace. | README and `.factory/demo.md` audit; `@claim:demo-isolation`. |
| F-1-17 | Rewrote offline copy as the visitor outcome. | `@claim:offline-reload` passed independently and live demo route was checked cold. |
| F-1-18 | Removed opaque deployment-policy prose. | README audit. |
| F-1-19 | Rewrote privacy copy without runtime-script jargon. | `@claim:no-analytics` passed independently. |

Live checks: `verify-url.sh` passed on the root; live axe had zero violations on
`/?demo=1`, `/privacy/`, `/terms/`, and an unknown route. Screenshots and raw
checks are in `.factory/evidence/polish-1/`.
