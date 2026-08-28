# Personal Vocab Loop — polish round 1 handoff

## Status: PASS

Repair commit `3d779bf9c2eece15daffd401d7b1a804440fde80` was pushed to `main` and
deployed through the static work order on 2026-08-28 UTC. The live product is
<https://personal-vocab-loop.sociobot.in>.

## Delivered

- Closed every F-1-1 through F-1-19 finding in `.factory/review-1.md`; see
  `.factory/polish-1.md` for the finding-to-evidence map.
- Added the one-click `/?demo=1` isolated entry, persistent demo banner/reset,
  original offline replayable sample cue, and a tested cue backup round trip.
- Made route notices focus-safe, made schedule dates deterministic, and made
  recording privacy and the exact 10-second limit observable claim tests.
- Completed 404 canonical metadata, plain-language copy, phrase terminology,
  landing privacy limits, and the required catalog description.

## Exact verification evidence

- Fresh clean clone `/tmp/pvl-clean.NMXTaq/repo`: `npm ci`, then every one of
  the 15 exact commands in `.factory/claims.json` passed independently. This
  includes `demo-voice-cue`, recording privacy, clock boundary, schedule,
  backup, offline, and update claims.
- Local gates: `npm run typecheck`, `npm run lint`, `npm run build`, and
  `npm test` passed (Vitest 4/4; Playwright 32/32). Production output is `dist/`.
- Production deploy: `/opt/fleet/lib/deploy-static.sh personal-vocab-loop dist`
  succeeded (deployment id `7b950fc6-4ac1-43d6-a63e-b969b4a0bfe4`).
- Live: `verify-url.sh https://personal-vocab-loop.sociobot.in` passed with
  title, language, main landmark, image alt, and no console errors.
- Live axe: zero violations on `/?demo=1`, `/privacy/`, `/terms/`, and the
  designed unknown-route 404. The unknown URL returned HTTP 404 and its
  canonical is `/404`; manifest MIME and immutable asset caching were checked.
- Live Lighthouse (mobile): Performance **100**, Accessibility **100**; LCP
  1,038 ms and CLS 0. The JSON report is in the polish evidence directory.
- Cold live reset kept focus on “Words that sound like you” immediately and
  after 4.3 seconds. Screenshots and raw checks are in
  `.factory/evidence/polish-1/`.

## Known gaps

None.
