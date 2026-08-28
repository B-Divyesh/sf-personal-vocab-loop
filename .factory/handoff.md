# Personal Vocab Loop — adversarial review 2 handoff

## Status: FAIL

Completed a read-only adversarial review of source commit
`4ffc19582d367f05c448612673a6712721954909` and the live product at
<https://personal-vocab-loop.sociobot.in>. No product code was modified.

## Delivered

- Wrote `.factory/review-2.md` with the cold mobile/desktop read, complete
  landing and README copy audit, demo and storage exercise, claim matrix,
  historical finding verification, structure/accessibility checks, missed
  leverage assessment, and a FAIL verdict.
- Rechecked all 19 findings from review 1 in both live behavior and source.
  F-1-5 and F-1-13 remain half-fixed and are blocking again under their
  original IDs.
- Recorded nine new findings. F-2-1 is blocking because the declared
  `demo-voice-cue` claim failed during `npm test`; F-2-2 through F-2-9 cover
  unlisted claims and copy terminology.

## Verification

- Fresh clone: `/tmp/pvl-review2.YCHMFB/repo`; `npm ci` passed.
- All 15 exact `.factory/claims.json` commands passed independently.
- `npm test` failed with 31/32 Playwright tests passing; the failure was
  `@claim:demo-voice-cue` after its backup import. Ten isolated repeats and a
  later `npm run test:claims` passed, confirming an intermittent missing-wait
  problem rather than clearing the observed failure.
- `npm run typecheck`, `npm run lint`, and `npm run build` passed. `dist/` was
  produced; app JavaScript was 10.49 kB gzip.
- Live cold reads at 390×844 and 1440×900 passed the first-screen clarity gate.
- Live demo isolation, Reset, Start for real, same-origin traffic, and offline
  recall passed. The sample audio was confirmed in source to be two synthesized
  tones rather than speech.
- Live route/metadata/link/focus checks passed. `verify-url.sh` passed, and axe
  reported zero violations on root, demo, Privacy, Terms, and the designed 404.

## Required next work

Resolve every finding in `.factory/review-2.md`, especially the spoken sample,
the unstable voice-backup claim test, and phrase/recall terminology. Then rerun
the entire review from a clean clone. Do not treat the later passing claim run
as sufficient evidence while the full-suite failure remains reproducible in
the review record.
