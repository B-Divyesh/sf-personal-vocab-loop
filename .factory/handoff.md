# Personal Vocab Loop — adversarial review 1 handoff

## Status: FAIL

An adversarial first-read review was completed against commit `c415d7f` and the live site on 2026-08-28 UTC. No product code was changed. The full report is `.factory/review-1.md`.

## What was done

- Captured cold 390×844 and 1440×900 first screens before scrolling.
- Audited every landing and README sentence, plus headings and actions.
- Exercised the live demo, isolated storage, Reset, Start for real, same-origin networking, and offline recall after legal-page visits.
- Ran all 14 claim commands separately from a fresh local clone and ran the full local test/build gates.
- Crawled live routes and links; checked metadata, deep links, back navigation, focus, 404, visual identity, accessibility, and asset sizes.
- Read all required historical review/polish/handoff artifacts; no earlier review or polish file exists.

## Verification summary

- Clean-clone claim run: 14/14 passed.
- Separate exact claim run: `recall-schedule` failed once by 1 ms, then passed on later runs; this is a blocking flaky gate.
- `npm test`: Vitest 4/4 and Playwright 30/30 passed.
- Typecheck, lint, and production build passed; `dist/` was produced.
- Live `verify-url.sh` passed; live root axe scan found zero violations.
- Live demo isolation/reset/exit and offline recall passed.
- Live delayed-focus check failed: focus moved from the route `<h1>` to `<body>` when the four-second notice timer re-rendered the app.

## What remains

The report records 19 findings: five blocking, six major, and eight minor. Highest priority is stable route focus, deterministic schedule timing, complete recording/privacy claim coverage, and a demo sample with a playable voice cue. README claim registration/copy and the remaining structure metadata must also be corrected before another review can pass.
